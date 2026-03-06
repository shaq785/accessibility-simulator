"use client";

import { useState } from "react";
import type { AeoAnalyzeResult } from "@/lib/aeo/types";

interface DownloadReportButtonProps {
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

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const pathPart =
      u.pathname === "/" ? "" : u.pathname.replace(/\//g, "-").replace(/^-|-$/g, "");
    const slug = pathPart ? `${host}-${pathPart}` : host;
    return slug.slice(0, 60) || "report";
  } catch {
    return "report";
  }
}

export function DownloadReportButton({ result }: DownloadReportButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const md = toMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aeo-report-${slugFromUrl(result.url)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
    >
      {downloaded ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Downloaded
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download report
        </>
      )}
    </button>
  );
}
