// Lossy PNG: reduce the image to a palette of N colors (DECISIONS D-018 in the
// Python version). image-q builds the palette from a downscaled sample (its point
// objects would need >1 GB for a 12 MP image); applying the palette with
// Floyd–Steinberg dithering is done here on typed arrays.

import { resizeNearest } from "./pixels";

const SAMPLE_PIXELS = 512 * 512;

/** Quality 1–100 → 2–256 colors (same mapping as the Python version). */
export function paletteColors(quality: number): number {
  return Math.max(2, Math.min(256, Math.round((256 * quality) / 100)));
}

async function buildPalette(image: ImageData, colors: number): Promise<Uint8Array> {
  const iq = await import("image-q");
  const scale = Math.min(1, Math.sqrt(SAMPLE_PIXELS / (image.width * image.height)));
  const sample =
    scale < 1
      ? resizeNearest(image, Math.max(1, Math.round(image.width * scale)), Math.max(1, Math.round(image.height * scale)))
      : image;
  const points = iq.utils.PointContainer.fromUint8Array(new Uint8Array(sample.data.buffer), sample.width, sample.height);
  const palette = iq.buildPaletteSync([points], {
    colors,
    paletteQuantization: "wuquant",
    colorDistanceFormula: "euclidean-bt709",
  });
  return new Uint8Array(palette.getPointContainer().toUint8Array());
}

/** Returns a copy of the image using only the palette colors, dithered. */
export async function quantize(image: ImageData, colors: number): Promise<ImageData> {
  const palette = await buildPalette(image, colors);
  const count = palette.length / 4;
  const { width, height } = image;
  const source = image.data;
  const out = new Uint8ClampedArray(source.length);
  // Error buffers for the current and next row (r, g, b, a per pixel).
  let current = new Float32Array((width + 2) * 4);
  let next = new Float32Array((width + 2) * 4);
  const cache = new Map<number, number>();

  const nearest = (r: number, g: number, b: number, a: number): number => {
    const key = ((r >> 2) << 18) | ((g >> 2) << 12) | ((b >> 2) << 6) | (a >> 2);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let best = 0;
    let bestDistance = Infinity;
    for (let p = 0; p < count; p++) {
      const o = p * 4;
      const dr = r - palette[o];
      const dg = g - palette[o + 1];
      const db = b - palette[o + 2];
      const da = a - palette[o + 3];
      const distance = 0.2126 * dr * dr + 0.7152 * dg * dg + 0.0722 * db * db + da * da;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = p;
      }
    }
    cache.set(key, best);
    return best;
  };

  for (let y = 0; y < height; y++) {
    next.fill(0);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const e = (x + 1) * 4;
      const r = Math.min(255, Math.max(0, source[i] + current[e]));
      const g = Math.min(255, Math.max(0, source[i + 1] + current[e + 1]));
      const b = Math.min(255, Math.max(0, source[i + 2] + current[e + 2]));
      const a = Math.min(255, Math.max(0, source[i + 3] + current[e + 3]));
      const o = nearest(r, g, b, a) * 4;
      out[i] = palette[o];
      out[i + 1] = palette[o + 1];
      out[i + 2] = palette[o + 2];
      out[i + 3] = palette[o + 3];
      for (let c = 0; c < 4; c++) {
        const err = (c === 0 ? r : c === 1 ? g : c === 2 ? b : a) - palette[o + c];
        current[e + 4 + c] += (err * 7) / 16;
        next[e - 4 + c] += (err * 3) / 16;
        next[e + c] += (err * 5) / 16;
        next[e + 4 + c] += err / 16;
      }
    }
    [current, next] = [next, current];
  }
  return new ImageData(out, width, height);
}
