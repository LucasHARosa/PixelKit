// Static pixel field for the hero. Reserved area for the Pixel Trail effect
// (docs/DESIGN.md): the decoration stays inside this box and nowhere else.

const COLUMNS = 12;
const ROWS = 9;

// Deterministic pattern: a loose diagonal of filled cells, a few highlight cells.
function cellClass(x: number, y: number): string {
  const d = x - y;
  if ((x === 8 && y === 2) || (x === 5 && y === 6)) return "bg-highlight";
  if (d >= 2 && d <= 4 && (x + y) % 3 !== 0) return "bg-foreground";
  if (d >= 1 && d <= 5 && (x * 7 + y * 3) % 5 === 0) return "bg-foreground/15";
  return "";
}

export function HeroVisual() {
  return (
    <div aria-hidden className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {Array.from({ length: ROWS * COLUMNS }, (_, i) => {
          const x = i % COLUMNS;
          const y = Math.floor(i / COLUMNS);
          return <div key={i} className={`border-r border-b border-border/60 ${cellClass(x, y)}`} />;
        })}
      </div>
    </div>
  );
}
