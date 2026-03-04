"use client";

import { useState } from "react";
import type { AeoAnalyzeResult } from "@/lib/aeo/types";

interface CopyReportButtonProps {
  result: AeoAnalyzeResult;
}

function toMarkdown(result: AeoAnalyzeResult): string {
  const lines: string[] = [
    `# AEO Scanner Report`,
    ``,
    `**URL:** ${result.url}`,
    `**Score:** ${result.score}/100 — ${result.summary.badge}`,
    `**Checks:** ${result.summary.passed} passed, ${result.summary.failed} failed`,
    ``,
    `## Checks`,
  ];
  result.checks.forEach((c) => {
    lines.push(`- ${c.pass ? "✅" : "❌"} ${c.label} (${c.points}/${c.maxPoints})`);
    lines.push(`  ${c.notes}`);
  });
  lines.push(``, `## Suggested improvements`);
  result.suggestions.forEach((s) => lines.push(`- ${s}`));
  lines.push(``, `## What answer engines see`);
  const e = result.extracted;
  lines.push(`- **Title:** ${e.title}`);
  lines.push(`- **Meta description:** ${e.metaDescription}`);
  lines.push(`- **H1:** ${e.h1}`);
  lines.push(`- **Suggested snippet:** ${e.suggestedAnswerSnippet}`);
  if (e.jsonLdTypes.length) lines.push(`- **JSON-LD types:** ${e.jsonLdTypes.join(", ")}`);
  return lines.join("\n");
}

export function CopyReportButton({ result }: CopyReportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const md = toMarkdown(result);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy report
        </>
      )}
    </button>
  );
}
