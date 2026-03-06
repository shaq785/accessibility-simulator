/** AEO Scanner types — Answer Engine Optimization (not WCAG). */

/** Evidence shown for a check: the content analyzed and what was found or missing. */
export type CheckEvidence =
  | {
      type: "answer-first";
      firstParagraph: string;
      firstParagraphLength: number;
      inRange: boolean;
      titleLength: number;
      titleOk: boolean;
      metaLength: number;
      metaOk: boolean;
    }
  | {
      type: "paragraphs";
      items: { text: string; note: string; found: boolean; highlight?: string }[];
    }
  | {
      type: "headings";
      headings: { level: number; text: string }[];
      issue?: string;
      hasListOrTable: boolean;
    }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "snippet"; snippet: string; matched: string }
  | { type: "schema"; types: string[] };

export interface AeoCheck {
  id: string;
  label: string;
  pass: boolean;
  points: number;
  maxPoints: number;
  notes: string;
  /** Content analyzed and what was found — for validation and highlighting in UI. */
  evidence?: CheckEvidence;
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
