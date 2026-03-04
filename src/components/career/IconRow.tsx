"use client";

export interface IconItem {
  emoji: string;
  label: string;
}

interface IconRowProps {
  items: IconItem[];
  className?: string;
}

export function IconRow({ items, className = "" }: IconRowProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-6 md:gap-8 ${className}`}
      role="list"
    >
      {items.map(({ emoji, label }) => (
        <div
          key={label}
          className="flex flex-col items-center text-center"
          role="listitem"
        >
          <span
            className="text-5xl md:text-6xl mb-2"
            role="img"
            aria-hidden="true"
          >
            {emoji}
          </span>
          <span className="text-lg md:text-xl font-medium text-slate-800 max-w-[140px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
