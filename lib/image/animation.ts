// Counts frames in animated GIF, PNG (APNG) and WebP files from their structure,
// without decoding. Browsers decode only the first frame into a canvas.

import type { DetectedFormat } from "@/lib/codecs/sniff";

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function gifFrames(bytes: Uint8Array): number {
  let offset = 13;
  const flags = bytes[10];
  if (flags & 0x80) offset += 3 * (1 << ((flags & 0x07) + 1)); // global color table
  let frames = 0;
  const skipSubBlocks = () => {
    while (offset < bytes.length && bytes[offset] !== 0) offset += bytes[offset] + 1;
    offset += 1;
  };
  while (offset < bytes.length) {
    const block = bytes[offset];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      offset += 2; // extension introducer + label
      skipSubBlocks();
    } else if (block === 0x2c) {
      frames += 1;
      const localFlags = bytes[offset + 9];
      offset += 10;
      if (localFlags & 0x80) offset += 3 * (1 << ((localFlags & 0x07) + 1));
      offset += 1; // LZW minimum code size
      skipSubBlocks();
    } else {
      break;
    }
  }
  return Math.max(1, frames);
}

function pngFrames(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    if (type === "acTL" && offset + 12 <= bytes.length) return Math.max(1, view.getUint32(offset + 8));
    if (type === "IDAT" || type === "IEND") break;
    offset += 12 + length;
  }
  return 1;
}

function webpFrames(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let frames = 0;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    if (type === "ANMF") frames += 1;
    offset += 8 + size + (size % 2);
  }
  return Math.max(1, frames);
}

/** Number of frames; 1 for still images and formats that can't animate. */
export function countFrames(bytes: Uint8Array, format: DetectedFormat): number {
  try {
    if (format === "gif") return gifFrames(bytes);
    if (format === "png") return pngFrames(bytes);
    if (format === "webp") return webpFrames(bytes);
  } catch {
    // A malformed structure is reported by the decoder, not here.
  }
  return 1;
}
