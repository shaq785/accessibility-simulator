"use client";

interface BeforeAfterCardProps {
  label: string;
  variant: "before" | "after";
  children: React.ReactNode;
  className?: string;
}

export function BeforeAfterCard({
  label,
  variant,
  children,
  className = "",
}: BeforeAfterCardProps) {
  const isBefore = variant === "before";
  return (
    <div
      className={`rounded-2xl border-4 p-6 flex flex-col min-h-[200px] ${className} ${
        isBefore
          ? "border-amber-200 bg-amber-50/50"
          : "border-green-300 bg-green-50/50"
      }`}
    >
      <span
        className={`text-xl font-bold mb-3 block ${
          isBefore ? "text-amber-800" : "text-green-800"
        }`}
      >
        {label}
      </span>
      <div className="flex-1 flex items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
