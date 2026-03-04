"use client";

import type { AeoExtracted } from "@/lib/aeo/types";

interface AnswerEngineViewProps {
  extracted: AeoExtracted;
}

export function AnswerEngineView({ extracted }: AnswerEngineViewProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">
        What an answer engine sees
      </h3>
      <p className="text-sm text-slate-400">
        This is the kind of structure and content systems can use to extract clear answers. It does not guarantee ranking.
      </p>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="font-medium text-slate-500 mb-0.5">Title</dt>
          <dd className="text-slate-200">{extracted.title || "(none)"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 mb-0.5">Meta description</dt>
          <dd className="text-slate-200">{extracted.metaDescription || "(none)"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 mb-0.5">Canonical</dt>
          <dd className="text-slate-200 break-all">{extracted.canonical || "(none)"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 mb-0.5">H1</dt>
          <dd className="text-slate-200">{extracted.h1 || "(none)"}</dd>
        </div>

        {extracted.headings.length > 0 && (
          <div>
            <dt className="font-medium text-slate-500 mb-1">Headings</dt>
            <dd>
              <ul className="list-disc list-inside space-y-0.5 text-slate-200">
                {extracted.headings.map((h, i) => (
                  <li key={i}>
                    <span className="text-slate-500">H{h.level}</span> {h.text}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {extracted.topParagraphs.length > 0 && (
          <div>
            <dt className="font-medium text-slate-500 mb-1">Top paragraphs</dt>
            <dd className="space-y-2 text-slate-200">
              {extracted.topParagraphs.map((p, i) => (
                <p key={i} className="border-l-2 border-slate-600 pl-3">
                  {p}
                </p>
              ))}
            </dd>
          </div>
        )}

        <div>
          <dt className="font-medium text-slate-500 mb-0.5">Suggested answer snippet</dt>
          <dd className="text-slate-200 italic">&ldquo;{extracted.suggestedAnswerSnippet || "(none)"}&rdquo;</dd>
        </div>

        {extracted.faq.length > 0 && (
          <div>
            <dt className="font-medium text-slate-500 mb-1">FAQ</dt>
            <dd>
              <ul className="space-y-2">
                {extracted.faq.map((item, i) => (
                  <li key={i} className="border border-slate-600 rounded-lg p-3">
                    <p className="font-medium text-slate-200">{item.q}</p>
                    <p className="text-slate-400 mt-1">{item.a}</p>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}

        {extracted.jsonLdTypes.length > 0 && (
          <div>
            <dt className="font-medium text-slate-500 mb-1">Structured data (JSON-LD)</dt>
            <dd>
              <span className="inline-flex flex-wrap gap-1">
                {extracted.jsonLdTypes.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">
                    {t}
                  </span>
                ))}
              </span>
            </dd>
          </div>
        )}

        {extracted.keyLinks.length > 0 && (
          <div>
            <dt className="font-medium text-slate-500 mb-1">Key links</dt>
            <dd>
              <ul className="space-y-1 text-slate-200">
                {extracted.keyLinks.slice(0, 10).map((link, i) => (
                  <li key={i}>
                    <span className="font-medium">{link.text}</span>
                    <span className="text-slate-500 text-xs ml-2 break-all">{link.href}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
