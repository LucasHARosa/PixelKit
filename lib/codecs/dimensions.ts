// Reads width and height from file headers without decoding the pixels, so a huge
// image can be rejected (or just described) before it allocates hundreds of MB.

import type { DetectedFormat } from "./sniff";

export type Size = { width: number; height: number };

/** Bytes read from the start of the file. JPEG SOF markers can sit after a large EXIF block. */
export const HEADER_BYTES = 256 * 1024;

function png(view: DataView): Size | null {
  if (view.byteLength < 24) return null;
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function gif(view: DataView): Size | null {
  if (view.byteLength < 10) return null;
  return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
}

function bmp(view: DataView): Size | null {
  if (view.byteLength < 26) return null;
  return { width: Math.abs(view.getInt32(18, true)), height: Math.abs(view.getInt32(22, true)) };
}

function webp(view: DataView, bytes: Uint8Array): Size | null {
  if (view.byteLength < 30) return null;
  const chunk = String.fromCharCode(...bytes.subarray(12, 16));
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8 ") {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  return null;
}

function jpeg(view: DataView): Size | null {
  let offset = 2;
  while (offset + 9 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;
    const marker = view.getUint8(offset + 1);
    // SOF0–SOF15, except DHT (C4), JPG (C8) and DAC (CC), carry the frame size.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }
    offset += 2 + view.getUint16(offset + 2);
  }
  return null;
}

/** Header dimensions, or null when the format isn't covered or the header is incomplete. */
export function readDimensions(bytes: Uint8Array, format: DetectedFormat): Size | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (format) {
    case "png":
      return png(view);
    case "gif":
      return gif(view);
    case "bmp":
      return bmp(view);
    case "webp":
      return webp(view, bytes);
    case "jpeg":
      return jpeg(view);
    default:
      return null;
  }
}
