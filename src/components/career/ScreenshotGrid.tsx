"use client";

import { useState } from "react";

export interface ScreenshotItem {
  src: string;
  label: string;
}

interface ScreenshotGridProps {
  items: ScreenshotItem[];
  className?: string;
}

function ScreenshotCard({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="rounded-2xl border-4 border-slate-200 bg-white overflow-hidden shadow-lg">
      <div className="aspect-video bg-slate-100 flex items-center justify-center min-h-[120px]">
        {failed ? (
          <div className="text-slate-400 text-center p-4">
            <span className="text-4xl block mb-2" aria-hidden="true">
              🖼️
            </span>
            <span className="text-sm font-medium">Photo coming soon</span>
          </div>
        ) : (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="p-3 text-center">
        <span className="font-bold text-lg text-slate-800">{label}</span>
      </div>
    </div>
  );
}

export function ScreenshotGrid({ items, className = "" }: ScreenshotGridProps) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl ${className}`}
    >
      {items.map(({ src, label }) => (
        <ScreenshotCard key={label} src={src} label={label} />
      ))}
    </div>
  );
}
