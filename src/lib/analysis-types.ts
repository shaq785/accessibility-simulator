export interface AxeViolationNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface AxeViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeViolationNode[];
  tags: string[];
}

export interface AnalysisSummary {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  passes: number;
}

export interface AnalysisResult {
  url: string;
  summary: AnalysisSummary;
  violations: AxeViolation[];
  passedRules: number;
  testEngine: string;
}

export interface AnalysisError {
  error: string;
}

export type AnalysisResponse = AnalysisResult | AnalysisError;

export function isAnalysisError(response: AnalysisResponse): response is AnalysisError {
  return "error" in response;
}

export function getOverallStatus(summary: AnalysisSummary): "good" | "needs-attention" | "issues-found" {
  if (summary.critical > 0 || summary.serious > 0) return "issues-found";
  if (summary.moderate > 0 || summary.minor > 0) return "needs-attention";
  return "good";
}

export function getImpactColor(impact: AxeViolation["impact"]): string {
  switch (impact) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "serious": return "text-orange-400 bg-orange-500/10 border-orange-500/30";
    case "moderate": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    case "minor": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
  }
}
