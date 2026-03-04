"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AeoScoreCard,
  ChecksList,
  AnswerEngineView,
  CopyReportButton,
  DemoSwitcher,
  GoodDemoContent,
  BadDemoContent,
  GOOD_EXTRACTED,
  BAD_EXTRACTED,
} from "@/components/aeo";
import type { AeoAnalyzeResult } from "@/lib/aeo/types";

type DemoPage = "good" | "bad";
type Mode = "demo" | "analyze";

export default function AeoPage() {
  const [mode, setMode] = useState<Mode>("demo");
  const [activePage, setActivePage] = useState<DemoPage>("good");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AeoAnalyzeResult | null>(null);

  const runAnalysis = async (payload: { url?: string; demo?: "good" | "bad" }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/aeo-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Analysis failed.");
        return;
      }
      setResult(data as AeoAnalyzeResult);
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    runAnalysis({ url: url.trim() });
  };

  const handleDemo = (demo: "good" | "bad") => {
    runAnalysis({ demo });
  };

  const demoExtracted = activePage === "good" ? GOOD_EXTRACTED : BAD_EXTRACTED;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header — matches simulator */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="font-semibold hidden sm:inline">AEO Scanner</span>
          </Link>

          <div className="flex items-center gap-3">
            {mode === "demo" && (
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setActivePage("good")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePage === "good" ? "bg-green-600 text-white" : "text-slate-300 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Good </span>Demo
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage("bad")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activePage === "bad" ? "bg-red-600 text-white" : "text-slate-300 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Bad </span>Demo
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("demo")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "demo" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                <span className="hidden sm:inline">Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("analyze")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === "analyze" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white"}`}
              >
                <span className="hidden sm:inline">Analyze</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mode === "demo" ? (
        /* Demo mode — same layout as simulator: strip + main content + sidebar */
        <div className="flex-1 flex flex-col md:flex-row md:items-start">
          <main className="flex-1 flex flex-col min-w-0">
            <div className="bg-slate-700 px-4 py-2 text-sm text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activePage === "good" ? "bg-green-500" : "bg-red-500"}`} />
              <span>Viewing: /aeo/demo/{activePage}</span>
            </div>
            <div className="bg-white flex-1 min-h-0" role="region" aria-label="AEO demo page preview">
              <div className="p-4 md:p-6 max-w-4xl mx-auto">
                {activePage === "good" ? <GoodDemoContent /> : <BadDemoContent />}
              </div>
            </div>
          </main>

          <aside className="md:w-80 flex-shrink-0 md:sticky md:top-0 md:self-start border-t md:border-t-0 md:border-l border-slate-700">
            <div className="p-4 bg-slate-800 min-h-full">
              <AnswerEngineView extracted={demoExtracted} />
              <p className="mt-3 text-xs text-slate-500">
                {activePage === "good"
                  ? "Good demo includes JSON-LD (FAQPage + Organization) and clear structure."
                  : "Bad demo has no JSON-LD, weak title/meta, and vague links."}
              </p>
            </div>
          </aside>
        </div>
      ) : (
        /* Analyze mode — URL input + results (like Site Analyzer) */
        <div className="flex-1">
          <div className="bg-slate-800 border-b border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <h2 className="font-semibold text-white">AEO Scanner (Quick Signals)</h2>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                This checks if your page is easy for answer engines to understand. It helps systems extract clear answers—not a guarantee of ranking.
              </p>
              <form onSubmit={handleAnalyze} className="flex gap-2 flex-wrap">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                  aria-label="URL to analyze"
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
                    "Analyze"
                  )}
                </button>
              </form>
              <div className="flex items-center gap-3 flex-wrap mt-3">
                <span className="text-xs text-slate-500">Or run against internal demos:</span>
                <DemoSwitcher onSelectDemo={handleDemo} loading={loading} />
              </div>
            </div>

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

            {loading && (
              <div className="p-4 space-y-4 animate-pulse">
                <div className="h-24 bg-slate-700 rounded-lg" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-14 bg-slate-700 rounded-lg" />
                  ))}
                </div>
                <div className="h-64 bg-slate-700 rounded-lg" />
              </div>
            )}

            {result && !loading && (
              <div className="p-4 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <AeoScoreCard result={result} />
                  <CopyReportButton result={result} />
                </div>

                {result.suggestions.length > 0 && (
                  <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">Suggested improvements</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                      {result.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Checks</h3>
                  <ChecksList checks={result.checks} />
                </section>

                <section>
                  <AnswerEngineView extracted={result.extracted} />
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
