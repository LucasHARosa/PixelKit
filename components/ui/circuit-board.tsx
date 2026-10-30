"use client";

// Adapted from Cult UI's circuit-board (MIT, https://github.com/nolly-studio/cult-ui):
// the traces-into-a-chip idea is kept; the gradients, glows, colored pulses and
// technology cards are removed to match docs/DESIGN.md. Used only for long operations.

import { usePrefersReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const TRACES = [
  "M0 30H96C100.4 30 104 33.6 104 38V58C104 62.4 107.6 66 112 66H150",
  "M0 70H150",
  "M0 110H96C100.4 110 104 106.4 104 102V82C104 77.6 107.6 74 112 74H150",
  "M250 66H288C292.4 66 296 62.4 296 58V38C296 33.6 299.6 30 304 30H400",
  "M250 74H400",
  "M250 82H288C292.4 82 296 85.6 296 90V102C296 106.4 299.6 110 304 110H400",
];

type CircuitBoardProps = {
  /** Text on the chip, e.g. "ISNet · WebGPU". */
  label: string;
  className?: string;
};

/** Decorative "work in progress" visual. Pair it with a real ProgressBar for the numbers. */
export function CircuitBoard({ label, className }: CircuitBoardProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className={cn("relative mx-auto w-full max-w-md", className)}>
      <svg viewBox="0 0 400 140" className="h-auto w-full overflow-visible" fill="none">
        <g className="stroke-border" strokeWidth="1.5" strokeLinecap="round">
          {TRACES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="fill-foreground/20">
          {[30, 70, 110].map((y) => (
            <circle key={`in-${y}`} cx="0" cy={y} r="2.5" />
          ))}
          {[30, 74, 110].map((y) => (
            <circle key={`out-${y}`} cx="400" cy={y} r="2.5" />
          ))}
        </g>
        {!reduceMotion &&
          TRACES.map((d, i) => (
            <circle key={`dot-${d}`} r="2.5" className="fill-foreground">
              <animateMotion dur={`${2.2 + (i % 3) * 0.4}s`} begin={`${i * 0.35}s`} path={d} repeatCount="indefinite" />
            </circle>
          ))}
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-mono text-xs whitespace-nowrap text-primary-foreground">
          <span className="size-2 animate-pulse rounded-xs bg-highlight" />
          {label}
        </div>
      </div>
    </div>
  );
}
