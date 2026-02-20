"use client";

import { useState } from "react";
import { AnalysisResult, AxeViolation, isAnalysisError, getOverallStatus, getImpactColor } from "@/lib/analysis-types";

interface SiteAnalyzerProps {
  onAnalysisComplete?: (result: AnalysisResult | null) => void;
}

export function SiteAnalyzer({ onAnalysisComplete }: SiteAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (isAnalysisError(data)) {
        setError(data.error);
        onAnalysisComplete?.(null);
      } else {
        setResult(data);
        onAnalysisComplete?.(data);
      }
    } catch {
      setError("Failed to connect to the analysis service. Please try again.");
      onAnalysisComplete?.(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleViolation = (id: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedViolations(newExpanded);
  };

  const getImpactIcon = (impact: AxeViolation["impact"]) => {
    switch (impact) {
      case "critical":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
      case "serious":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "moderate":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "minor":
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const getStatusBadge = () => {
    if (!result) return null;
    const status = getOverallStatus(result.summary);
    
    switch (status) {
      case "good":
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Passed</span>;
      case "needs-attention":
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">Needs Attention</span>;
      case "issues-found":
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">Issues Found</span>;
    }
  };

  const totalViolations = result ? result.summary.critical + result.summary.serious + result.summary.moderate + result.summary.minor : 0;

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      {/* URL Input */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h2 className="font-semibold text-white">Site Analysis</h2>
          <span className="text-xs text-slate-500">· Powered by axe-core</span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Site"
            )}
          </button>
        </form>
        {loading && (
          <p className="text-xs text-slate-400 mt-2">This may take up to 30 seconds while we load and analyze the page...</p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="p-4 space-y-4">
          {/* Status & URL */}
          <div className="flex items-center gap-3 flex-wrap">
            {getStatusBadge()}
            <span className="text-sm text-slate-400 truncate">{result.url}</span>
            <span className="text-xs text-slate-500 ml-auto">{result.testEngine}</span>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-5 gap-2 max-w-2xl">
            {[
              { label: "Critical", value: result.summary.critical, color: "red" },
              { label: "Serious", value: result.summary.serious, color: "orange" },
              { label: "Moderate", value: result.summary.moderate, color: "yellow" },
              { label: "Minor", value: result.summary.minor, color: "blue" },
              { label: "Passed", value: result.summary.passes, color: "green" },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-3 rounded-lg text-center bg-${color}-500/10`}>
                <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Violations List */}
          {totalViolations > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-400">
                {totalViolations} Accessibility {totalViolations === 1 ? "Issue" : "Issues"} Found
              </h3>
              {result.violations.map((violation) => (
                <div key={violation.id} className={`rounded-lg border ${getImpactColor(violation.impact)}`}>
                  <button
                    onClick={() => toggleViolation(violation.id)}
                    className="w-full p-3 flex items-start gap-3 text-left"
                  >
                    {getImpactIcon(violation.impact)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{violation.help}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded bg-${violation.impact === "critical" ? "red" : violation.impact === "serious" ? "orange" : violation.impact === "moderate" ? "yellow" : "blue"}-500/20`}>
                          {violation.impact}
                        </span>
                        <span className="text-xs text-slate-500">
                          {violation.nodes.length} {violation.nodes.length === 1 ? "element" : "elements"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">{violation.description}</p>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform shrink-0 ${expandedViolations.has(violation.id) ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedViolations.has(violation.id) && (
                    <div className="px-3 pb-3 pt-0 space-y-3">
                      {violation.nodes.map((node, i) => (
                        <div key={i} className="bg-slate-900/50 rounded p-2 text-xs">
                          <div className="text-slate-400 mb-1">Element {i + 1}:</div>
                          <code className="block text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                            {node.html}
                          </code>
                          {node.failureSummary && (
                            <p className="text-slate-400 mt-2">{node.failureSummary}</p>
                          )}
                        </div>
                      ))}
                      <a
                        href={violation.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Learn more about this issue
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-400 font-medium">No accessibility issues detected!</p>
              <p className="text-xs text-slate-400 mt-1">{result.passedRules} accessibility rules passed</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
