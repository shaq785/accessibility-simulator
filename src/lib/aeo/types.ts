/** AEO Scanner types — Answer Engine Optimization (not WCAG). */

export interface AeoCheck {
  id: string;
  label: string;
  pass: boolean;
  points: number;
  maxPoints: number;
  notes: string;
}

export interface AeoExtracted {
  title: string;
  metaDescription: string;
  canonical: string;
  h1: string;
  headings: { level: number; text: string }[];
  topParagraphs: string[];
  faq: { q: string; a: string }[];
  jsonLdTypes: string[];
  keyLinks: { text: string; href: string }[];
  suggestedAnswerSnippet: string;
}

export interface AeoAnalyzeResult {
  url: string;
  score: number;
  summary: {
    passed: number;
    failed: number;
    totalChecks: number;
    badge: "Good" | "Needs work";
  };
  checks: AeoCheck[];
  extracted: AeoExtracted;
  suggestions: string[];
}

export interface AeoExtractedForDemo {
  title: string;
  metaDescription: string;
  canonical: string;
  h1: string;
  headings: { level: number; text: string }[];
  topParagraphs: string[];
  faq: { q: string; a: string }[];
  jsonLdTypes: string[];
  keyLinks: { text: string; href: string }[];
  suggestedAnswerSnippet: string;
}
