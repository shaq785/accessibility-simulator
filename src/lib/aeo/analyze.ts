/**
 * AEO (Answer Engine Optimization) analyzer.
 * Based on the "Answer Engine AEO Checklist" (Audience Strategy / Field Notes).
 * Server-side only. Parses HTML with cheerio. No AI/LLMs.
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { AeoAnalyzeResult, AeoCheck, AeoExtracted } from "./types";

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

/** Heuristic: body contains numbers/%, quotes, or research-like language (no LLM) */
function hasOriginalInsightsHeuristic($: cheerio.CheerioAPI): boolean {
  const bodyText = $("body").text().replace(/\s+/g, " ");
  if (bodyText.length < 100) return false;
  if (/\d+%/.test(bodyText)) return true;
  if (/\d+\s+of\s+\d+/.test(bodyText)) return true;
  if (/["'][^"']{10,}["']/.test(bodyText)) return true;
  const lower = bodyText.toLowerCase();
  if (/\b(study|survey|research|found|case study|according to|statistic|data)\b/.test(lower)) return true;
  return false;
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

  // —— 1. Put the Answer First (20 pts)
  const oneH1 = h1s.length === 1 && h1Text.length > 0;
  const introText = topParagraphs[0] ?? "";
  const answerLikeIntro = introText.length >= 80 && introText.length <= 400;
  const titleLen = title.length;
  const titleOk = titleLen >= 30 && titleLen <= 65;
  const descLen = metaDesc.length;
  const descOk = descLen >= 70 && descLen <= 160;
  const answerFirstOk = oneH1 && answerLikeIntro && titleOk && descOk;
  earnedPoints += answerFirstOk ? 20 : 0;
  checks.push({
    id: "answer-first",
    label: "1. Put the Answer First",
    pass: answerFirstOk,
    points: answerFirstOk ? 20 : 0,
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
  });

  // —— 2. Add Context (15 pts)
  const hasContext = allParagraphs.length >= 3;
  earnedPoints += hasContext ? 15 : 0;
  checks.push({
    id: "add-context",
    label: "2. Add Context",
    pass: hasContext,
    points: hasContext ? 15 : 0,
    maxPoints: 15,
    notes: hasContext
      ? `Found ${allParagraphs.length} substantial paragraphs; supporting context present.`
      : "Add 2–3 supporting paragraphs after the answer (examples, definitions, methodology).",
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
  earnedPoints += structureOk ? 15 : 0;
  checks.push({
    id: "structure",
    label: "3. Add Structure to the Page",
    pass: structureOk,
    points: structureOk ? 15 : 0,
    maxPoints: 15,
    notes: !headingHierarchyOk
      ? "Fix heading hierarchy (H1→H2→H3, no skipped levels)."
      : !hasListOrTable
        ? "Add at least one list or table so the page is scannable."
        : "Clear heading structure and scannable content (lists/tables).",
  });

  // —— 4. Include an FAQ (15 pts)
  const hasFaq = faq.length >= 1;
  const faqCountNote = hasFaq && faq.length < 5 ? " PDF recommends 5–8 questions." : "";
  earnedPoints += hasFaq ? 15 : 0;
  checks.push({
    id: "faq",
    label: "4. Include an FAQ",
    pass: hasFaq,
    points: hasFaq ? 15 : 0,
    maxPoints: 15,
    notes: hasFaq ? `Found ${faq.length} Q/A(s).${faqCountNote}` : "Add a dedicated FAQ section; use natural language questions and 2–4 sentence answers; consider FAQPage schema.",
  });

  // —— 5. Original Insights (10 pts, heuristic)
  const hasInsights = hasOriginalInsightsHeuristic($);
  earnedPoints += hasInsights ? 10 : 0;
  checks.push({
    id: "original-insights",
    label: "5. Include Original Insights",
    pass: hasInsights,
    points: hasInsights ? 10 : 0,
    maxPoints: 10,
    notes: hasInsights
      ? "Page contains stats, quotes, or research-like language (heuristic)."
      : "Include original research, stats, or expert quotes; verify manually for best results.",
  });

  // —— 6. Connect to Product (10 pts)
  const hasInternalDescriptive =
    internalLinks.length >= 1 && internalLinks.every((l) => !VAGUE_LINK_PATTERNS.some((p) => p.test(l.text)));
  const connectOk = keyLinks.length === 0 ? true : hasInternalDescriptive && vagueLinks.length === 0;
  earnedPoints += connectOk ? 10 : 0;
  checks.push({
    id: "connect-product",
    label: "6. Connect Points to the Product",
    pass: connectOk,
    points: connectOk ? 10 : 0,
    maxPoints: 10,
    notes: vagueLinks.length > 0
      ? `Avoid vague link text (e.g. "${vagueLinks[0]?.text ?? "click here"}"). Use descriptive internal links.`
      : internalLinks.length < 1 && keyLinks.length > 0
        ? "Add internal links with descriptive anchor text so extracted passages can reference your brand."
        : "Internal links use descriptive text; ensure key insights connect to product/brand.",
  });

  // —— 7. Embed Schema Markup (15 pts)
  const hasSchema = PDF_JSON_LD_TYPES.some((t) => jsonLdTypes.includes(t));
  earnedPoints += hasSchema ? 15 : 0;
  checks.push({
    id: "schema-markup",
    label: "7. Embed Schema Markup",
    pass: hasSchema,
    points: hasSchema ? 15 : 0,
    maxPoints: 15,
    notes: hasSchema
      ? `Found: ${jsonLdTypes.filter((t) => PDF_JSON_LD_TYPES.includes(t)).join(", ") || "—"}.`
      : "Add JSON-LD for FAQPage, Article, HowTo, Product, Organization, or BreadcrumbList (schema.org).",
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
