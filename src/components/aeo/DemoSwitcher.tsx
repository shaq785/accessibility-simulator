"use client";

interface DemoSwitcherProps {
  onSelectDemo: (demo: "good" | "bad") => void;
  loading: boolean;
}

export function DemoSwitcher({ onSelectDemo, loading }: DemoSwitcherProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectDemo("good")}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30"
      >
        Try Good Demo
      </button>
      <button
        type="button"
        onClick={() => onSelectDemo("bad")}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/30"
      >
        Try Bad Demo
      </button>
    </div>
  );
}
