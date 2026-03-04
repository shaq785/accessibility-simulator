"use client";

import { useState } from "react";
import type { AeoCheck } from "@/lib/aeo/types";

interface ChecksListProps {
  checks: AeoCheck[];
}

export function ChecksList({ checks }: ChecksListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {checks.map((check) => {
        const isExpanded = expandedId === check.id;
        return (
          <div
            key={check.id}
            className={`rounded-lg border overflow-hidden ${
              check.pass ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"
            }`}
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : check.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-700/50 transition-colors"
            >
              {check.pass ? (
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center" aria-hidden>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center" aria-hidden>
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              <span className="flex-1 font-medium text-white">{check.label}</span>
              <span className="text-sm text-slate-400">
                {check.points}/{check.maxPoints} pts
              </span>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 pl-14">
                <p className="text-sm text-slate-400">{check.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
