// Test images for the W0 spike. Runs inside workers (OffscreenCanvas).

export const SAMPLE_WIDTH = 4000;
export const SAMPLE_HEIGHT = 3000;

/** A 12 MP synthetic "photo": soft background, a subject in the middle and sensor-like noise. */
export function makeSamplePhoto(width = SAMPLE_WIDTH, height = SAMPLE_HEIGHT): ImageData {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("OffscreenCanvas 2D is not available in this browser");

  ctx.fillStyle = "#9db4c0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#c9d6df";
  ctx.fillRect(0, height * 0.65, width, height * 0.35);

  // Subject: a figure-like shape, so the segmentation model has something to find.
  ctx.fillStyle = "#7a3b2e";
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.33, width * 0.07, height * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2f4858";
  ctx.beginPath();
  ctx.ellipse(width / 2, height * 0.72, width * 0.16, height * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  let seed = 42;
  for (let i = 0; i < data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const noise = (seed % 17) - 8;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  return image;
}

/** Decodes a user file into RGBA pixels, or falls back to the synthetic photo. */
export async function loadPixels(file?: Blob): Promise<ImageData> {
  if (!file) return makeSamplePhoto();
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("OffscreenCanvas 2D is not available in this browser");
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

/** Small PNG preview of RGBA pixels, drawn over a checkerboard so transparency shows. */
export async function previewPng(rgba: Uint8ClampedArray, width: number, height: number, maxSide = 480): Promise<Blob> {
  const full = new OffscreenCanvas(width, height);
  full.getContext("2d")!.putImageData(new ImageData(rgba as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0);

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const small = new OffscreenCanvas(w, h);
  const ctx = small.getContext("2d")!;
  const cell = 12;
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      ctx.fillStyle = ((x + y) / cell) % 2 === 0 ? "#ffffff" : "#e7e7e3";
      ctx.fillRect(x, y, cell, cell);
    }
  }
  ctx.drawImage(full, 0, 0, w, h);
  return small.convertToBlob({ type: "image/png" });
}

/** Bytes transferred for WASM files fetched by this worker (from Resource Timing). */
export function wasmTransfer(pattern: RegExp): { name: string; transferKB: number; decodedKB: number }[] {
  return performance
    .getEntriesByType("resource")
    .filter((entry) => pattern.test(entry.name))
    .map((entry) => {
      const timing = entry as PerformanceResourceTiming;
      return {
        name: timing.name.split("/").pop() ?? timing.name,
        transferKB: Math.round(timing.transferSize / 1024),
        decodedKB: Math.round(timing.decodedBodySize / 1024),
      };
    });
}
