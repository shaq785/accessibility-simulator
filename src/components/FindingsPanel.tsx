"use client";

import { Finding } from "@/lib/types";

interface FindingsPanelProps {
  findings: Finding[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function FindingsPanel({ findings, isExpanded, onToggleExpand }: FindingsPanelProps) {
  const getSeverityStyles = (severity: Finding["severity"]) => {
    switch (severity) {
      case "error": return "bg-red-500/10 border-red-500/30 text-red-200";
      case "warning": return "bg-yellow-500/10 border-yellow-500/30 text-yellow-200";
      default: return "bg-blue-500/10 border-blue-500/30 text-blue-200";
    }
  };

  const getSeverityIcon = (severity: Finding["severity"]) => {
    const iconClass = severity === "error" ? "text-red-400" : severity === "warning" ? "text-yellow-400" : "text-blue-400";
    return (
      <svg className={`w-5 h-5 ${iconClass} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {severity === "error" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : severity === "warning" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    );
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 md:border-t-0 md:border-l">
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between text-white md:hidden"
        aria-expanded={isExpanded}
      >
        <span className="font-medium flex items-center gap-2">
          Findings
          {findings.length > 0 && (
            <span className="bg-blue-500 text-xs px-2 py-0.5 rounded-full">{findings.length}</span>
          )}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`${isExpanded ? "block" : "hidden"} md:block`}>
        <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <h2 className="font-medium text-white">Findings</h2>
          {findings.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{findings.length}</span>
          )}
        </div>

        <div className="p-4 space-y-3 max-h-[40vh] overflow-auto md:max-h-none">
          {findings.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              Enable lenses to see relevant findings for the current page.
            </p>
          ) : (
            findings.map((finding) => (
              <article key={finding.id} className={`p-3 rounded-lg border ${getSeverityStyles(finding.severity)}`}>
                <div className="flex items-start gap-2 mb-1">
                  {getSeverityIcon(finding.severity)}
                  <h3 className="font-medium text-sm leading-tight">{finding.title}</h3>
                </div>
                <p className="text-sm opacity-80 ml-7">{finding.description}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
