import type { LabResult } from "./types";

// Upper bound of the search, kept moderate so the probe itself can't exhaust memory
// on a desktop (12000² RGBA ≈ 576 MB).
const MAX_SIDE = 12000;

function canvasWorks(side: number): boolean {
  const canvas = document.createElement("canvas");
  try {
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(side - 1, side - 1, 1, 1);
    return ctx.getImageData(side - 1, side - 1, 1, 1).data[0] === 255;
  } catch {
    return false;
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/** Largest square 2D canvas that still draws, found by binary search. */
export function probeMaxCanvas(): LabResult {
  let low = 256;
  let high = MAX_SIDE;
  if (canvasWorks(high)) {
    return {
      value: `≥ ${high}×${high} (${Math.round((high * high) / 1e6)} MP, probe cap)`,
      pass: null,
      details: { "max side (px)": `≥ ${high}`, "max area (MP)": `≥ ${Math.round((high * high) / 1e6)}` },
    };
  }
  while (high - low > 16) {
    const mid = Math.floor((low + high) / 2);
    if (canvasWorks(mid)) low = mid;
    else high = mid;
  }
  return {
    value: `${low}×${low} (${Math.round((low * low) / 1e5) / 10} MP)`,
    pass: null,
    details: { "max side (px)": low, "max area (MP)": Math.round((low * low) / 1e5) / 10 },
  };
}
