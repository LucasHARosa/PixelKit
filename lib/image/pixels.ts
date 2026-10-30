// Small operations on RGBA pixel buffers. Run inside workers.

export type Rgb = { r: number; g: number; b: number };

/** "#RRGGBB" → {r, g, b}. Falls back to white on anything else. */
export function parseHexColor(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return { r: 255, g: 255, b: 255 };
  const value = parseInt(match[1], 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function hasTransparency(image: ImageData): boolean {
  const data = image.data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

/** Composites the image over a solid color. Returns a new, fully opaque image. */
export function flatten(image: ImageData, background: Rgb): ImageData {
  const source = image.data;
  const out = new Uint8ClampedArray(source.length);
  for (let i = 0; i < source.length; i += 4) {
    const alpha = source[i + 3] / 255;
    out[i] = source[i] * alpha + background.r * (1 - alpha);
    out[i + 1] = source[i + 1] * alpha + background.g * (1 - alpha);
    out[i + 2] = source[i + 2] * alpha + background.b * (1 - alpha);
    out[i + 3] = 255;
  }
  return new ImageData(out, image.width, image.height);
}

/** Copies a rectangle out of the image. */
export function crop(image: ImageData, x: number, y: number, width: number, height: number): ImageData {
  const out = new Uint8ClampedArray(width * height * 4);
  const rowBytes = width * 4;
  for (let row = 0; row < height; row++) {
    const start = ((y + row) * image.width + x) * 4;
    out.set(image.data.subarray(start, start + rowBytes), row * rowBytes);
  }
  return new ImageData(out, width, height);
}

/** Center crop to the given size. */
export function centerCrop(image: ImageData, width: number, height: number): ImageData {
  const x = Math.floor((image.width - width) / 2);
  const y = Math.floor((image.height - height) / 2);
  return crop(image, x, y, width, height);
}

/** Nearest-neighbor resize (pixel art, hard edges). */
export function resizeNearest(image: ImageData, width: number, height: number): ImageData {
  const out = new Uint32Array(width * height);
  const source = new Uint32Array(image.data.buffer, image.data.byteOffset, image.width * image.height);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(image.height - 1, Math.floor(((y + 0.5) * image.height) / height));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(image.width - 1, Math.floor(((x + 0.5) * image.width) / width));
      out[y * width + x] = source[sy * image.width + sx];
    }
  }
  return new ImageData(new Uint8ClampedArray(out.buffer), width, height);
}
