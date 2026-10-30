/// <reference lib="webworker" />
import * as Comlink from "comlink";
import { HEADER_BYTES, readDimensions } from "@/lib/codecs/dimensions";
import { formatInfo, sniffBytes, type DetectedFormat } from "@/lib/codecs/sniff";
import { MAX_IMAGE_PIXELS } from "@/lib/limits";
import { ToolError } from "./errors";

/** Formats the browser itself decodes with createImageBitmap in every target browser. */
const BROWSER_DECODABLE: DetectedFormat[] = ["png", "jpeg", "gif", "webp", "avif", "bmp", "ico"];

export type ImageInfo = {
  format: DetectedFormat;
  formatLabel: string;
  mime: string;
  size: number;
  /** Null when this format isn't decoded yet (HEIC, TIFF, SVG). */
  width: number | null;
  height: number | null;
  /** Null when it wasn't checked (format not decoded yet, or image above the pixel limit). */
  hasAlpha: boolean | null;
  /** True when the image is above MAX_IMAGE_PIXELS, so it was described but not decoded. */
  tooLarge: boolean;
};

async function decode(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new ToolError("CORRUPT_FILE");
  }
}

/** True when at least one pixel isn't fully opaque. Stops at the first one found. */
function hasTransparency(bitmap: ImageBitmap): boolean {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new ToolError("PROCESSING_FAILED", "This browser can't draw images inside workers.");
  ctx.drawImage(bitmap, 0, 0);
  // Read in horizontal bands so a large image doesn't need one huge pixel buffer.
  const band = Math.max(1, Math.floor(4_000_000 / bitmap.width));
  for (let y = 0; y < bitmap.height; y += band) {
    const rows = Math.min(band, bitmap.height - y);
    const data = ctx.getImageData(0, y, bitmap.width, rows).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
  }
  return false;
}

const api = {
  async inspect(file: Blob): Promise<ImageInfo> {
    const head = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
    const format = sniffBytes(head);
    if (!format || format === "pdf") throw new ToolError("UNSUPPORTED_FORMAT");
    const info = formatInfo[format];
    const base = { format, formatLabel: info.label, mime: info.mime, size: file.size };

    const header = readDimensions(head, format);
    if (header && header.width * header.height > MAX_IMAGE_PIXELS) {
      return { ...base, ...header, hasAlpha: null, tooLarge: true };
    }
    if (!BROWSER_DECODABLE.includes(format)) {
      return { ...base, width: header?.width ?? null, height: header?.height ?? null, hasAlpha: null, tooLarge: false };
    }

    const bitmap = await decode(file);
    try {
      return {
        ...base,
        width: bitmap.width,
        height: bitmap.height,
        hasAlpha: format === "jpeg" ? false : hasTransparency(bitmap),
        tooLarge: false,
      };
    } finally {
      bitmap.close();
    }
  },
};

export type ImageWorkerApi = typeof api;
Comlink.expose(api);
