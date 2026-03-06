"use client";

import { useState } from "react";
import type { CheckEvidence } from "@/lib/aeo/types";

interface CheckEvidenceViewProps {
  evidence: CheckEvidence;
  checkId: string;
}

/** Highlights a phrase inside text by wrapping it in a span. */
function highlightPhrase(text: string, phrase: string): React.ReactNode {
  if (!phrase || !text.includes(phrase)) return text;
  const i = text.indexOf(phrase);
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-emerald-500/30 text-emerald-200 rounded px-0.5">{phrase}</mark>
      {text.slice(i + phrase.length)}
    </>
  );
}

function ParagraphsCarousel({
  items,
  checkId,
  emptyMessage,
}: {
  items: { text: string; note: string; found: boolean; highlight?: string }[];
  checkId: string;
  emptyMessage: string;
}) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }
  const item = items[index];
  const hasMultiple = items.length > 1;

  return (
    <div className="space-y-2">
      {hasMultiple && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            Paragraph {index + 1} of {items.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIndex((i) => (i === 0 ? items.length - 1 : i - 1))}
              className="p-1 rounded bg-slate-600 text-slate-300 hover:bg-slate-500 text-xs"
              aria-label="Previous"
            >
              ←
            </button>
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-indigo-400" : "bg-slate-600 hover:bg-slate-500"
                }`}
                aria-label={`Go to paragraph ${i + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={() => setIndex((i) => (i === items.length - 1 ? 0 : i + 1))}
              className="p-1 rounded bg-slate-600 text-slate-300 hover:bg-slate-500 text-xs"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      )}
      <div
        className={`rounded-lg border p-3 text-sm ${
          item.found
            ? "border-green-500/30 bg-green-500/5"
            : checkId === "connect-product"
              ? "border-slate-600 bg-slate-800/50"
              : "border-amber-500/30 bg-amber-500/5"
        }`}
      >
        <p className="text-xs font-medium text-slate-400 mb-1">{item.note}</p>
        <blockquote className="text-slate-200 leading-relaxed">
          {item.highlight ? highlightPhrase(item.text, item.highlight) : item.text}
        </blockquote>
      </div>
    </div>
  );
}

export function CheckEvidenceView({ evidence, checkId }: CheckEvidenceViewProps) {
  switch (evidence.type) {
    case "answer-first":
      return (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`rounded p-2 ${evidence.titleOk ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
              Title: {evidence.titleLength} chars {evidence.titleOk ? "✓" : "(aim 30–65)"}
            </div>
            <div className={`rounded p-2 ${evidence.metaOk ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
              Meta: {evidence.metaLength} chars {evidence.metaOk ? "✓" : "(aim 70–160)"}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">
              First paragraph: {evidence.firstParagraphLength} chars {evidence.inRange ? "✓ in range (80–400)" : "— aim 80–400"}
            </p>
            <blockquote className="rounded-lg border border-slate-600 bg-slate-800/50 p-3 text-slate-200 text-xs leading-relaxed">
              {evidence.firstParagraph || "(none)"}
            </blockquote>
          </div>
        </div>
      );

    case "paragraphs":
      return (
        <div className="space-y-2">
          {checkId === "connect-product" && (
            <p className="text-xs text-slate-500">
              The score is based on the page having descriptive internal links somewhere. Not every paragraph needs to contain a link. Below we show which paragraphs contain an internal link’s anchor text (so extracted passages can include a link); we don’t detect brand wording in the text.
            </p>
          )}
          <ParagraphsCarousel
            items={evidence.items}
            checkId={checkId}
            emptyMessage="No paragraphs analyzed."
          />
        </div>
      );

    case "headings":
      return (
        <div className="space-y-2 text-sm">
          {evidence.issue && (
            <p className="text-amber-400 text-xs">Issue: {evidence.issue}</p>
          )}
          <p className={`text-xs ${evidence.hasListOrTable ? "text-green-400" : "text-amber-400"}`}>
            List or table: {evidence.hasListOrTable ? "Yes ✓" : "None found"}
          </p>
          <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-2">
            <p className="text-xs text-slate-500 mb-1">Heading outline:</p>
            <ul className="space-y-0.5 text-slate-200 text-xs">
              {evidence.headings.map((h, i) => (
                <li key={i}>
                  <span className="text-slate-500">H{h.level}</span> {h.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "faq":
      if (evidence.items.length === 0) {
        return <p className="text-sm text-slate-500">No FAQ items detected.</p>;
      }
      return (
        <div className="space-y-2">
          {evidence.items.map((item, i) => (
            <div key={i} className="rounded-lg border border-green-500/20 bg-green-500/5 p-2 text-sm">
              <p className="font-medium text-slate-200 text-xs">Q: {item.q}</p>
              <p className="text-slate-400 text-xs mt-1">A: {item.a.slice(0, 120)}{item.a.length > 120 ? "…" : ""}</p>
            </div>
          ))}
        </div>
      );

    case "snippet":
      return (
        <div className="space-y-2 text-sm">
          <p className={`text-xs ${evidence.matched !== "none (no stats, quotes, or research terms detected)" ? "text-green-400" : "text-amber-400"}`}>
            Matched: {evidence.matched}
          </p>
          <blockquote className="rounded-lg border border-slate-600 bg-slate-800/50 p-3 text-slate-200 text-xs leading-relaxed">
            {evidence.snippet}
          </blockquote>
        </div>
      );

    case "schema":
      if (evidence.types.length === 0) {
        return <p className="text-sm text-slate-500">No JSON-LD types found.</p>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {evidence.types.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-slate-600 text-slate-200 text-xs">
              {t}
            </span>
          ))}
        </div>
      );

    default:
      return null;
  }
}
