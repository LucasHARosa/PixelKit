"use client";

import PixelTrail from "@/components/originkit/ui/pixel-trail";
import { usePrefersReducedMotion } from "@/lib/hooks/use-reduced-motion";

// The only animated decoration on the landing (docs/DESIGN.md). It stays inside
// this box; with reduced motion, and in the static HTML, a still pixel field
// takes its place.

const COLUMNS = 12;
const ROWS = 9;

// Pixel Trail blends each cell with "difference": on a white ground a cell of
// #E8E8E8 comes out as #171717, the ink color. The white caption differences to
// black on the ground and to light gray over the trail.
const GROUND = "#FFFFFF";
const CELL = "#E8E8E8";

// Deterministic pattern: a loose diagonal of filled cells, a few highlight cells.
function cellClass(x: number, y: number): string {
  const d = x - y;
  if ((x === 8 && y === 2) || (x === 5 && y === 6)) return "bg-highlight";
  if (d >= 2 && d <= 4 && (x + y) % 3 !== 0) return "bg-foreground";
  if (d >= 1 && d <= 5 && (x * 7 + y * 3) % 5 === 0) return "bg-foreground/15";
  return "";
}

function StaticField() {
  return (
    <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
      {Array.from({ length: ROWS * COLUMNS }, (_, i) => {
        const x = i % COLUMNS;
        const y = Math.floor(i / COLUMNS);
        return <div key={i} className={`border-r border-b border-border/60 ${cellClass(x, y)}`} />;
      })}
    </div>
  );
}

export function HeroVisual() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card">
      {reduceMotion ? (
        <StaticField />
      ) : (
        <PixelTrail
          text="PIXELKIT"
          background={GROUND}
          textColor="#FFFFFF"
          font={{
            fontFamily: "var(--font-press-start), monospace",
            fontSize: 88,
            fontWeight: 400,
            letterSpacing: "0",
            lineHeight: 1.3,
          }}
          columns={24}
          pixel={{ color: CELL, gap: 0, radius: 0 }}
          trail={{ hold: 0.25, fade: 0.6, reach: 0 }}
        />
      )}
    </div>
  );
}
