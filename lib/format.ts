const UNITS = ["B", "KB", "MB", "GB"] as const;

/** 1536 → "1.5 KB". Uses 1024-based units, like file managers on Windows. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(digits)} ${UNITS[unit]}`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

export function formatMegapixels(width: number, height: number): string {
  return `${(Math.round((width * height) / 1e5) / 10).toFixed(1)} MP`;
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}
