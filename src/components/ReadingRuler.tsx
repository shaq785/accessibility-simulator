"use client";

import { useEffect, useState } from "react";

export function ReadingRuler({ enabled }: { enabled: boolean }) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const handleMouseMove = (e: MouseEvent) => setPosition(e.clientY - 16);
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled]);

  if (!enabled) return null;

  return <div className="reading-ruler" style={{ top: `${position}px` }} aria-hidden="true" />;
}
