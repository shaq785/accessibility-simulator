"use client";

import type { AeoAnalyzeResult } from "@/lib/aeo/types";

interface AeoScoreCardProps {
  result: AeoAnalyzeResult;
}

export function AeoScoreCard({ result }: AeoScoreCardProps) {
  const { score, summary } = result;
  const isGood = summary.badge === "Good";

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
              isGood ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {score}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">AEO Score</p>
            <p className="text-white font-semibold text-lg">0–100</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isGood ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {summary.badge}
          </span>
        </div>
        <div className="text-sm text-slate-400 ml-auto">
          {summary.passed} passed · {summary.failed} failed
        </div>
      </div>
    </div>
  );
}
