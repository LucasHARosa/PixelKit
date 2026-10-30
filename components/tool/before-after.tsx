"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type BeforeAfterProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Checkerboard behind the images, so transparency is visible. */
  checkerboard?: boolean;
  className?: string;
};

/** Two images stacked, with a slider that reveals the "after" one from the left. */
export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  checkerboard = false,
  className,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const sliderId = useId();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className={cn("relative overflow-hidden rounded-2xl border border-border", checkerboard ? "bg-checkerboard" : "bg-card")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs, nothing to optimize */}
        <img src={beforeSrc} alt={beforeLabel} className="block h-auto w-full select-none" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={afterSrc} alt={afterLabel} className="block h-auto w-full select-none" draggable={false} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-foreground" style={{ left: `${position}%` }} />
        <span className="absolute top-3 left-3 rounded-md bg-card/90 px-2 py-1 font-mono text-xs">{afterLabel}</span>
        <span className="absolute top-3 right-3 rounded-md bg-card/90 px-2 py-1 font-mono text-xs">{beforeLabel}</span>
      </div>
      <label htmlFor={sliderId} className="sr-only">
        Compare {afterLabel.toLowerCase()} and {beforeLabel.toLowerCase()}
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="w-full accent-foreground"
      />
    </div>
  );
}
