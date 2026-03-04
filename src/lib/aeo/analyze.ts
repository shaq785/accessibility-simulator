/**
 * AEO (Answer Engine Optimization) analyzer.
 * Server-side only. Parses HTML with cheerio and runs checks + extraction.
 * Does NOT use AI/LLMs. Educational tool to see what answer engines can extract.
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

const KNOWN_JSON_LD_TYPES = [
  "Organization",
  "WebSite",
  "Article",
  "FAQPage",
  "HowTo",
  "Product",
  "LocalBusiness",
];

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
  // dl dt/dd
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
  // details/summary as Q/A
  $("details").each((_, det) => {
    const $det = $(det);
    const q = $det.find("summary").text().replace(/\s+/g, " ").trim();
    const a = $det.children().not("summary").text().replace(/\s+/g, " ").trim();
    if (q && a) faqs.push({ q, a });
  });
  // Headings that look like FAQ (e.g. "Q: ..." or section with "FAQ")
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
    if (total >= maxChars) return false; // break
    const text = getText($, el);
    if (text.length < 30) return;
    paragraphs.push(text);
    total += text.length;
  });
  return paragraphs.slice(0, 3);
}

function buildSuggestedSnippet(paragraphs: string[]): string {
  const first = paragraphs[0] ?? "";
  const maxLen = 280;
  if (first.length <= maxLen) return first;
  const truncated = first.slice(0, maxLen - 3).trim();
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen / 2 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

export function analyzeAeo(html: string, url: string): AeoAnalyzeResult {
  const $ = cheerio.load(html);
  const checks: AeoCheck[] = [];
  let totalPoints = 0;
  let earnedPoints = 0;

  const baseUrl = url.replace(/\/[^/]*$/, "/");

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
  const suggestedAnswerSnippet = buildSuggestedSnippet(topParagraphs);

  const keyLinks: { text: string; href: string }[] = [];
  $("a[href]").each((_, el) => {
    if (keyLinks.length >= 10) return false;
    const $a = $(el);
    const href = $a.attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    const text = getText($, el);
    if (!text) return;
    const absolute = href.startsWith("http") ? href : new URL(href, baseUrl).href;
    keyLinks.push({ text, href: absolute });
  });

  // —— Check 1: Title (30–65 chars, ~8 pts)
  const titleLen = title.length;
  const titleOk = titleLen >= 30 && titleLen <= 65;
  totalPoints += 8;
  if (titleOk) earnedPoints += 8;
  checks.push({
    id: "title",
    label: "Title tag present and descriptive (30–65 chars)",
    pass: titleOk,
    points: titleOk ? 8 : 0,
    maxPoints: 8,
    notes: title ? `Length: ${titleLen} chars. ${titleOk ? "Good." : titleLen < 30 ? "Too short." : "Too long."}` : "Title tag missing.",
  });

  // —— Check 2: Meta description (70–160 chars, ~8 pts)
  const descLen = metaDesc.length;
  const descOk = descLen >= 70 && descLen <= 160;
  totalPoints += 8;
  if (descOk) earnedPoints += 8;
  checks.push({
    id: "meta-description",
    label: "Meta description present (70–160 chars)",
    pass: descOk,
    points: descOk ? 8 : 0,
    maxPoints: 8,
    notes: metaDesc ? `Length: ${descLen} chars. ${descOk ? "Good." : descLen < 70 ? "Too short." : "Too long."}` : "Meta description missing.",
  });

  // —— Check 3: Exactly one H1 (~8 pts)
  const oneH1 = h1s.length === 1 && h1Text.length > 0;
  totalPoints += 8;
  if (oneH1) earnedPoints += 8;
  checks.push({
    id: "h1",
    label: "Exactly one H1 that matches page topic",
    pass: oneH1,
    points: oneH1 ? 8 : 0,
    maxPoints: 8,
    notes: h1s.length === 0 ? "No H1 found." : h1s.length > 1 ? `Multiple H1s (${h1s.length}).` : "One clear H1.",
  });

  // —— Check 4: Heading structure (~8 pts)
  let headingOk = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      headingOk = false;
      break;
    }
  }
  if (headings.length > 0 && headings[0].level !== 1) headingOk = false;
  totalPoints += 8;
  if (headingOk && headings.length >= 2) earnedPoints += 8;
  checks.push({
    id: "heading-structure",
    label: "Clear heading structure (H2/H3, no big jumps)",
    pass: headingOk,
    points: headingOk && headings.length >= 2 ? 8 : 0,
    maxPoints: 8,
    notes: headingOk ? "Logical heading hierarchy." : "Skipped levels or no H1.",
  });

  // —— Check 5: First 300–500 chars answer-like (~8 pts)
  const introText = topParagraphs[0] ?? "";
  const introOk = introText.length >= 80 && introText.length <= 600;
  totalPoints += 8;
  if (introOk) earnedPoints += 8;
  checks.push({
    id: "intro-summary",
    label: "First 300–500 chars contain a clear answer-like summary",
    pass: introOk,
    points: introOk ? 8 : 0,
    maxPoints: 8,
    notes: introText.length >= 80 ? "Strong intro paragraph found." : "Add a clear intro paragraph (80+ chars).",
  });

  // —— Check 6: FAQ section or FAQPage JSON-LD (~8 pts)
  const hasFaq = faq.length >= 1;
  totalPoints += 8;
  if (hasFaq) earnedPoints += 8;
  checks.push({
    id: "faq",
    label: "FAQ section and/or FAQPage JSON-LD",
    pass: hasFaq,
    points: hasFaq ? 8 : 0,
    maxPoints: 8,
    notes: hasFaq ? `Found ${faq.length} Q/A(s).` : "No FAQ section or FAQPage schema detected.",
  });

  // —— Check 7: Structured data (at least one known type) (~10 pts)
  const hasStructured = KNOWN_JSON_LD_TYPES.some((t) => jsonLdTypes.includes(t));
  totalPoints += 10;
  if (hasStructured) earnedPoints += 10;
  checks.push({
    id: "json-ld",
    label: "Structured data JSON-LD (Organization, WebSite, Article, FAQPage, HowTo, etc.)",
    pass: hasStructured,
    points: hasStructured ? 10 : 0,
    maxPoints: 10,
    notes: hasStructured ? `Types: ${jsonLdTypes.join(", ") || "—"}.` : "No recognized JSON-LD found.",
  });

  // —— Check 8: Internal links descriptive (~6 pts)
  const vagueLinks = keyLinks.filter((l) => VAGUE_LINK_PATTERNS.some((p) => p.test(l.text)));
  const descriptiveOk = vagueLinks.length === 0 && keyLinks.length > 0;
  totalPoints += 6;
  if (descriptiveOk) earnedPoints += 6;
  checks.push({
    id: "link-text",
    label: "Internal links with descriptive anchor text",
    pass: descriptiveOk,
    points: descriptiveOk ? 6 : 0,
    maxPoints: 6,
    notes: vagueLinks.length > 0 ? `Vague link text found (e.g. "${vagueLinks[0]?.text ?? ""}").` : "Links use descriptive text.",
  });

  // —— Check 9: Images alt text (~6 pts)
  const imgs = $("img");
  const imgsWithoutAlt: number[] = [];
  imgs.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null || alt.trim() === "") imgsWithoutAlt.push(1);
  });
  const altOk = imgsWithoutAlt.length === 0;
  totalPoints += 6;
  if (altOk || imgs.length === 0) earnedPoints += 6;
  checks.push({
    id: "image-alt",
    label: "Images have alt text that supports understanding",
    pass: altOk || imgs.length === 0,
    points: altOk || imgs.length === 0 ? 6 : 0,
    maxPoints: 6,
    notes: imgs.length === 0 ? "No images; N/A." : altOk ? "All images have alt." : `${imgsWithoutAlt.length} image(s) missing alt.`,
  });

  // —— Check 10: Author/date (~5 pts)
  const publishedMeta = $('meta[property="article:published_time"], meta[name="datePublished"]').attr("content");
  const authorMeta = $('meta[name="author"], meta[property="article:author"]').attr("content");
  const hasAuthorDate = !!(publishedMeta || authorMeta);
  totalPoints += 5;
  if (hasAuthorDate) earnedPoints += 5;
  checks.push({
    id: "author-date",
    label: "Author/date signals (for article pages)",
    pass: hasAuthorDate,
    points: hasAuthorDate ? 5 : 0,
    maxPoints: 5,
    notes: hasAuthorDate ? "Author or date meta found." : "Consider adding article:published_time or author meta.",
  });

  // —— Check 11: Contact/Trust (~5 pts)
  const footerText = $("footer").text().toLowerCase();
  const hasContactLink = $('a[href*="contact"], a[href*="about"], a[href*="about-us"]').length > 0;
  const hasTrust = /contact|about|@|phone|address|email/.test(footerText) || hasContactLink;
  totalPoints += 5;
  if (hasTrust) earnedPoints += 5;
  checks.push({
    id: "contact-trust",
    label: "Contact/Trust signals (About, Contact, footer)",
    pass: hasTrust,
    points: hasTrust ? 5 : 0,
    maxPoints: 5,
    notes: hasTrust ? "Contact or About links/footer content found." : "Add About/Contact links or footer with contact info.",
  });

  // —— Check 12: Scannable content (~6 pts)
  const allParagraphs = $("p").map((_, el) => getText($, el)).get();
  const listCount = $("ul, ol").length;
  const avgLen = allParagraphs.length ? allParagraphs.reduce((a, p) => a + p.length, 0) / allParagraphs.length : 0;
  const scannableOk = listCount >= 1 || (avgLen > 0 && avgLen <= 250);
  totalPoints += 6;
  if (scannableOk) earnedPoints += 6;
  checks.push({
    id: "scannable",
    label: "Scannable content (lists, short paragraphs)",
    pass: scannableOk,
    points: scannableOk ? 6 : 0,
    maxPoints: 6,
    notes: listCount >= 1 ? `Lists found: ${listCount}.` : avgLen <= 250 ? "Reasonable paragraph length." : "Add lists or shorten paragraphs.",
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passedCount = checks.filter((c) => c.pass).length;
  const badge: "Good" | "Needs work" = score >= 70 ? "Good" : "Needs work";
  const failedChecks = checks.filter((c) => !c.pass);
  const suggestions = failedChecks
    .slice(0, 5)
    .map((c) => c.notes)
    .filter(Boolean);

  const extracted: AeoExtracted = {
    title: title || "(no title)",
    metaDescription: metaDesc || "(none)",
    canonical: canonical || "(none)",
    h1: h1Text || "(none)",
    headings,
    topParagraphs,
    faq,
    jsonLdTypes,
    keyLinks,
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
