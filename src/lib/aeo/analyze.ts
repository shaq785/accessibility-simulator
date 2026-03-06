/**
 * AEO (Answer Engine Optimization) analyzer.
 * Based on the "Answer Engine AEO Checklist" (Audience Strategy / Field Notes).
 * Server-side only. Parses HTML with cheerio. No AI/LLMs.
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { AeoAnalyzeResult, AeoCheck, AeoExtracted, CheckEvidence } from "./types";

const VAGUE_LINK_PATTERNS = [
  /^click\s*here$/i,
  /^here$/i,
  /^read\s*more$/i,
  /^learn\s*more$/i,
  /^more$/i,
  /^link$/i,
];

const FAQ_HEADING_PATTERNS = [
  /^\s*faq\s*$/i,
  /frequently\s+asked/i,
  /questions?\s+and\s+answers?/i,
  /common\s+questions?/i,
];

/** PDF "Schema Types to Prioritize": Article, FAQPage, HowTo, Product, Organization, BreadcrumbList (+ BlogPosting) */
const PDF_JSON_LD_TYPES = [
  "Article",
  "BlogPosting",
  "FAQPage",
  "HowTo",
  "Product",
  "Organization",
  "BreadcrumbList",
];

/** PDF-based "How to Fix It" suggestion for each check (when failed) */
const SUGGESTION_BY_CHECK: Record<string, string> = {
  "answer-first":
    "Lead with the direct answer in the first sentence or two; use H1 as question, first paragraph as answer; keep title and meta description clear.",
  "add-context":
    "Add 2–3 paragraphs of supporting context (examples, definitions, methodology) after the answer.",
  structure:
    "Use H1→H2→H3 heading hierarchy with no skipped levels; add lists or tables; ensure each section can stand alone.",
  faq: "Add a dedicated FAQ section with natural language questions and 2–4 sentence answers; consider FAQPage schema (PDF recommends 5–8 questions).",
  "original-insights":
    "Include original research, stats, expert quotes, or case studies; cite sources so answer engines can surface unique content.",
  "connect-product":
    "Ensure key insights connect to your product or brand; use internal links so extracted passages still reference you.",
  "schema-markup":
    "Add JSON-LD for FAQPage, Article, HowTo, Product, Organization, or BreadcrumbList per schema.org.",
};

function getText($: cheerio.CheerioAPI, el: Element): string {
  return $(el).text().replace(/\s+/g, " ").trim();
}

function extractJsonLdTypes($: cheerio.CheerioAPI): string[] {
  const types = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html()?.trim();
      if (!text) return;
      const parsed = JSON.parse(text) as { "@type"?: string | string[]; "@graph"?: { "@type"?: string }[] };
      const addType = (t: string) => {
        if (t && typeof t === "string") types.add(t);
      };
      if (Array.isArray(parsed["@type"])) {
        parsed["@type"].forEach(addType);
      } else if (parsed["@type"]) {
        addType(parsed["@type"] as string);
      }
      if (Array.isArray(parsed["@graph"])) {
        parsed["@graph"].forEach((item) => {
          const t = item["@type"];
          if (Array.isArray(t)) t.forEach(addType);
          else if (t) addType(t);
        });
      }
    } catch {
      // ignore invalid JSON-LD
    }
  });
  return Array.from(types);
}

function extractFaqFromJsonLd($: cheerio.CheerioAPI): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html()?.trim();
      if (!text) return;
      const parsed = JSON.parse(text) as { "@type"?: string; mainEntity?: { name?: string; acceptedAnswer?: { text?: string } }[] };
      if (parsed["@type"] !== "FAQPage" || !Array.isArray(parsed.mainEntity)) return;
      parsed.mainEntity.forEach((item) => {
        const q = item.name?.trim();
        const a = item.acceptedAnswer?.text?.trim();
        if (q && a) faqs.push({ q, a });
      });
    } catch {
      // ignore
    }
  });
  return faqs;
}

function extractFaqFromMarkup($: cheerio.CheerioAPI): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  $("dl").each((_, dl) => {
    const $dl = $(dl);
    const dts = $dl.find("dt");
    dts.each((i, dt) => {
      const q = getText($, dt);
      const dd = $dl.find("dd").eq(i);
      const a = dd.length ? getText($, dd[0]) : "";
      if (q && a) faqs.push({ q, a });
    });
  });
  $("details").each((_, det) => {
    const $det = $(det);
    const q = $det.find("summary").text().replace(/\s+/g, " ").trim();
    const a = $det.children().not("summary").text().replace(/\s+/g, " ").trim();
    if (q && a) faqs.push({ q, a });
  });
  $("h2, h3, h4").each((_, h) => {
    const text = getText($, h);
    if (!FAQ_HEADING_PATTERNS.some((p) => p.test(text))) return;
    const $next = $(h).nextAll();
    let answer = "";
    for (let i = 0; i < $next.length; i++) {
      const node = $next[i];
      const tag = (node as unknown as { tagName?: string }).tagName?.toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "h4") break;
      if (tag === "p" || tag === "div") {
        answer = getText($, node);
        if (answer.length > 20) break;
      }
    }
    if (text && answer) faqs.push({ q: text, a: answer });
  });
  return faqs;
}

function getFirstMeaningfulParagraphs($: cheerio.CheerioAPI, maxChars: number): string[] {
  const paragraphs: string[] = [];
  let total = 0;
  $("p").each((_, el) => {
    if (total >= maxChars) return false;
    const text = getText($, el);
    if (text.length < 30) return;
    paragraphs.push(text);
    total += text.length;
  });
  return paragraphs;
}

function getAllMeaningfulParagraphs($: cheerio.CheerioAPI, minLen: number): string[] {
  const paragraphs: string[] = [];
  $("p").each((_, el) => {
    const text = getText($, el);
    if (text.length >= minLen) paragraphs.push(text);
  });
  return paragraphs;
}

function buildSuggestedSnippet(paragraphs: string[]): string {
  const first = paragraphs[0] ?? "";
  const maxLen = 280;
  if (first.length <= maxLen) return first;
  const truncated = first.slice(0, maxLen - 3).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen / 2 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

/** Text from main content only (excludes script, style) so we don't match code/analytics as "quoted text". */
function getMainContentText($: cheerio.CheerioAPI): string {
  return $("p, article, main, h1, h2, h3, h4, h5, h6, li, td, th").text().replace(/\s+/g, " ").trim();
}

/** Original-insights signals in main content only. Returns matched reasons for partial points. */
function getOriginalInsightsSignals($: cheerio.CheerioAPI): string[] {
  const mainText = getMainContentText($);
  if (mainText.length < 80) return [];
  const signals: string[] = [];
  if (/\d+%/.test(mainText)) signals.push("percentages/statistics");
  if (/\d+\s+of\s+\d+/.test(mainText)) signals.push("numeric data");
  const lower = mainText.toLowerCase();
  if (/\b(study|survey|research|found|case study|according to|statistic|data)\b/.test(lower)) signals.push("research-like terms");
  const pText = $("p").text().replace(/\s+/g, " ");
  if (/"[^"\\]{15,150}"/.test(pText) || /'[^'\\]{15,150}'/.test(pText)) signals.push("quoted text (in paragraphs)");
  return signals;
}

/** For each paragraph, check if it contains any internal link anchor text (for Connect to Product evidence). */
function getParagraphsWithLinkCheck(
  paragraphs: string[],
  internalLinks: { text: string; href: string }[]
): { text: string; note: string; found: boolean; highlight?: string }[] {
  return paragraphs.map((p) => {
    const link = internalLinks.find((l) => p.includes(l.text.trim()));
    if (link) {
      return { text: p, note: "Contains internal link", found: true, highlight: link.text.trim() };
    }
    return { text: p, note: "No internal link in this paragraph", found: false };
  });
}

export function analyzeAeo(html: string, url: string): AeoAnalyzeResult {
  const $ = cheerio.load(html);
  const checks: AeoCheck[] = [];
  const MAX_POINTS = 100;
  let earnedPoints = 0;

  const baseUrl = url.replace(/\/[^/]*$/, "/");
  let parsedBase: URL;
  try {
    parsedBase = new URL(url);
  } catch {
    parsedBase = new URL("https://example.com/");
  }
  const pageHost = parsedBase.hostname.toLowerCase();

  const title = $("title").first().text().replace(/\s+/g, " ").trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const h1s = $("h1");
  const h1Text = h1s.length === 1 ? getText($, h1s[0]) : "";
  const headings: { level: number; text: string }[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = (el as unknown as { tagName: string }).tagName;
    const level = parseInt(tagName.charAt(1), 10);
    headings.push({ level, text: getText($, el) });
  });

  const jsonLdTypes = extractJsonLdTypes($);
  const faqFromJsonLd = extractFaqFromJsonLd($);
  const faqFromMarkup = extractFaqFromMarkup($);
  const faq = faqFromJsonLd.length > 0 ? faqFromJsonLd : faqFromMarkup;

  const topParagraphs = getFirstMeaningfulParagraphs($, 600);
  const allParagraphs = getAllMeaningfulParagraphs($, 40);
  const suggestedAnswerSnippet = buildSuggestedSnippet(topParagraphs);

  const keyLinks: { text: string; href: string }[] = [];
  $("a[href]").each((_, el) => {
    if (keyLinks.length >= 15) return false;
    const $a = $(el);
    const href = $a.attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    const text = getText($, el);
    if (!text) return;
    const absolute = href.startsWith("http") ? href : new URL(href, baseUrl).href;
    keyLinks.push({ text, href: absolute });
  });

  const internalLinks = keyLinks.filter((l) => {
    try {
      return new URL(l.href).hostname.toLowerCase() === pageHost;
    } catch {
      return false;
    }
  });
  const vagueLinks = keyLinks.filter((l) => VAGUE_LINK_PATTERNS.some((p) => p.test(l.text)));

  // —— 1. Put the Answer First (20 pts) — partial: 5 each for H1, intro, title, meta
  const oneH1 = h1s.length === 1 && h1Text.length > 0;
  const introText = topParagraphs[0] ?? "";
  const answerLikeIntro = introText.length >= 80 && introText.length <= 400;
  const titleLen = title.length;
  const titleOk = titleLen >= 30 && titleLen <= 65;
  const descLen = metaDesc.length;
  const descOk = descLen >= 70 && descLen <= 160;
  const answerFirstPts = (oneH1 ? 5 : 0) + (answerLikeIntro ? 5 : 0) + (titleOk ? 5 : 0) + (descOk ? 5 : 0);
  const answerFirstOk = answerFirstPts === 20;
  earnedPoints += answerFirstPts;
  const answerFirstEvidence: CheckEvidence = {
    type: "answer-first",
    firstParagraph: introText.slice(0, 400) + (introText.length > 400 ? "…" : ""),
    firstParagraphLength: introText.length,
    inRange: answerLikeIntro,
    titleLength: titleLen,
    titleOk: titleOk,
    metaLength: descLen,
    metaOk: descOk,
  };
  checks.push({
    id: "answer-first",
    label: "1. Put the Answer First",
    pass: answerFirstOk,
    points: answerFirstPts,
    maxPoints: 20,
    notes: !oneH1
      ? "Need exactly one H1."
      : !answerLikeIntro
        ? introText.length < 80
          ? "First paragraph too short (aim 80–400 chars). Lead with the direct answer."
          : "First paragraph too long; keep the answer in the first 1–2 sentences."
        : !titleOk || !descOk
          ? `Title/meta: ${!titleOk ? "title 30–65 chars" : ""} ${!descOk ? "description 70–160 chars" : ""}.`.trim()
          : "Answer is at the top; title and meta are clear.",
    evidence: answerFirstEvidence,
  });

  // —— 2. Add Context (15 pts) — partial: 5 per paragraph for first 3
  const addContextPts = Math.min(15, allParagraphs.length * 5);
  earnedPoints += addContextPts;
  const addContextEvidence: CheckEvidence = {
    type: "paragraphs",
    items: allParagraphs.slice(0, 8).map((p, i) => ({
      text: p.slice(0, 350) + (p.length > 350 ? "…" : ""),
      note: `Paragraph ${i + 1} (${p.length} chars)`,
      found: true,
    })),
  };
  checks.push({
    id: "add-context",
    label: "2. Add Context",
    pass: addContextPts === 15,
    points: addContextPts,
    maxPoints: 15,
    notes: addContextPts === 15
      ? `Found ${allParagraphs.length} substantial paragraphs; supporting context present.`
      : "Add 2–3 supporting paragraphs after the answer (examples, definitions, methodology).",
    evidence: addContextEvidence,
  });

  // —— 3. Add Structure (15 pts)
  let headingHierarchyOk = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      headingHierarchyOk = false;
      break;
    }
  }
  if (headings.length > 0 && headings[0].level !== 1) headingHierarchyOk = false;
  const hasListOrTable = $("ul, ol").length >= 1 || $("table").length >= 1;
  const structureOk = headingHierarchyOk && headings.length >= 2 && hasListOrTable;
  let structureIssue: string | undefined;
  if (!headingHierarchyOk && headings.length >= 2) {
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level > headings[i - 1].level + 1) {
        structureIssue = `Skipped from H${headings[i - 1].level} to H${headings[i].level}`;
        break;
      }
    }
    if (!structureIssue && headings[0].level !== 1) structureIssue = `Starts with H${headings[0].level}, not H1`;
  }
  const structureEvidence: CheckEvidence = {
    type: "headings",
    headings,
    issue: structureIssue,
    hasListOrTable,
  };
  const structurePts = (headingHierarchyOk ? 5 : 0) + (headings.length >= 2 ? 5 : 0) + (hasListOrTable ? 5 : 0);
  earnedPoints += structurePts;
  checks.push({
    id: "structure",
    label: "3. Add Structure to the Page",
    pass: structurePts === 15,
    points: structurePts,
    maxPoints: 15,
    notes: !headingHierarchyOk
      ? "Fix heading hierarchy (H1→H2→H3, no skipped levels)."
      : !hasListOrTable
        ? "Add at least one list or table so the page is scannable."
        : "Clear heading structure and scannable content (lists/tables).",
    evidence: structureEvidence,
  });

  // —— 4. Include an FAQ (15 pts) — partial: 3 per item, max 15 (5 items = 15)
  const faqPts = Math.min(15, faq.length * 3);
  const faqCountNote = faq.length >= 1 && faq.length < 5 ? " PDF recommends 5–8 questions." : "";
  earnedPoints += faqPts;
  const faqEvidence: CheckEvidence = { type: "faq", items: faq };
  checks.push({
    id: "faq",
    label: "4. Include an FAQ",
    pass: faqPts === 15,
    points: faqPts,
    maxPoints: 15,
    notes: faq.length >= 1 ? `Found ${faq.length} Q/A(s).${faqCountNote}` : "Add a dedicated FAQ section; use natural language questions and 2–4 sentence answers; consider FAQPage schema.",
    evidence: faqEvidence,
  });

  // —— 5. Original Insights (10 pts) — partial: 3 for 1 signal, 6 for 2, 10 for 3+
  const insightsSignals = getOriginalInsightsSignals($);
  const insightsPts = insightsSignals.length >= 3 ? 10 : insightsSignals.length === 2 ? 6 : insightsSignals.length === 1 ? 3 : 0;
  earnedPoints += insightsPts;
  const mainContentText = getMainContentText($);
  const mainContentSnippet = mainContentText.slice(0, 300) + (mainContentText.length > 300 ? "…" : "");
  const originalInsightsEvidence: CheckEvidence = {
    type: "snippet",
    snippet: mainContentSnippet || "(no paragraph/heading content)",
    matched: insightsSignals.length
      ? insightsSignals.join("; ")
      : "none — we only look in main content (paragraphs, headings, lists) for stats, quotes, or research terms; script/code is ignored.",
  };
  checks.push({
    id: "original-insights",
    label: "5. Include Original Insights",
    pass: insightsPts === 10,
    points: insightsPts,
    maxPoints: 10,
    notes: insightsSignals.length >= 1
      ? `Found in main content: ${insightsSignals.join(", ")}.`
      : "Add stats, quotes, or research-like terms in your main copy (not in scripts); verify manually for best results.",
    evidence: originalInsightsEvidence,
  });

  // —— 6. Connect to Product (10 pts) — partial: 0 if vague links; else 5 for having internal links, +5 if no vague
  const connectProductItems = getParagraphsWithLinkCheck(allParagraphs.slice(0, 10), internalLinks);
  const hasInternalDescriptive =
    internalLinks.length >= 1 && internalLinks.every((l) => !VAGUE_LINK_PATTERNS.some((p) => p.test(l.text)));
  let connectPts = 0;
  if (vagueLinks.length > 0) connectPts = 0;
  else if (internalLinks.length >= 1 && hasInternalDescriptive) connectPts = 10;
  else if (internalLinks.length >= 1) connectPts = 5;
  else if (keyLinks.length > 0) connectPts = 0;
  else connectPts = 10;
  const connectProductEvidence: CheckEvidence = {
    type: "paragraphs",
    items: connectProductItems.map((item) => ({
      text: item.text.slice(0, 350) + (item.text.length > 350 ? "…" : ""),
      note: item.note,
      found: item.found,
      highlight: item.highlight,
    })),
  };
  earnedPoints += connectPts;
  checks.push({
    id: "connect-product",
    label: "6. Connect Points to the Product",
    pass: connectPts === 10,
    points: connectPts,
    maxPoints: 10,
    notes: vagueLinks.length > 0
      ? `Avoid vague link text (e.g. "${vagueLinks[0]?.text ?? "click here"}"). Use descriptive internal links.`
      : internalLinks.length < 1 && keyLinks.length > 0
        ? "Add internal links with descriptive anchor text so extracted passages can reference your brand."
        : "Internal links use descriptive text; ensure key insights connect to product/brand.",
    evidence: connectProductEvidence,
  });

  // —— 7. Embed Schema Markup (15 pts) — partial: 3 per PDF type found, max 15
  const pdfTypesFound = jsonLdTypes.filter((t) => PDF_JSON_LD_TYPES.includes(t));
  const schemaPts = Math.min(15, pdfTypesFound.length * 3);
  const schemaEvidence: CheckEvidence = { type: "schema", types: jsonLdTypes };
  earnedPoints += schemaPts;
  checks.push({
    id: "schema-markup",
    label: "7. Embed Schema Markup",
    pass: schemaPts === 15,
    points: schemaPts,
    maxPoints: 15,
    notes: pdfTypesFound.length >= 1
      ? `Found: ${jsonLdTypes.filter((t) => PDF_JSON_LD_TYPES.includes(t)).join(", ") || "—"}.`
      : "Add JSON-LD for FAQPage, Article, HowTo, Product, Organization, or BreadcrumbList (schema.org).",
    evidence: schemaEvidence,
  });

  const score = Math.round((earnedPoints / MAX_POINTS) * 100);
  const passedCount = checks.filter((c) => c.pass).length;
  const badge: "Good" | "Needs work" = score >= 70 ? "Good" : "Needs work";
  const failedChecks = checks.filter((c) => !c.pass);
  const suggestions = failedChecks
    .slice(0, 5)
    .map((c) => SUGGESTION_BY_CHECK[c.id] ?? c.notes)
    .filter(Boolean);

  const extracted: AeoExtracted = {
    title: title || "(no title)",
    metaDescription: metaDesc || "(none)",
    canonical: canonical || "(none)",
    h1: h1Text || "(none)",
    headings,
    topParagraphs: topParagraphs.slice(0, 3),
    faq,
    jsonLdTypes,
    keyLinks: keyLinks.slice(0, 10),
    suggestedAnswerSnippet: suggestedAnswerSnippet || "(none)",
  };

  return {
    url,
    score,
    summary: {
      passed: passedCount,
      failed: checks.length - passedCount,
      totalChecks: checks.length,
      badge,
    },
    checks,
    extracted,
    suggestions,
  };
}
