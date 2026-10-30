// File → RGBA pixels, inside a worker. EXIF orientation is applied by the
// browser decoder (createImageBitmap uses imageOrientation "from-image").

import { HEADER_BYTES, readDimensions } from "@/lib/codecs/dimensions";
import { formatInfo, sniffBytes, type DetectedFormat } from "@/lib/codecs/sniff";
import { MAX_IMAGE_PIXELS } from "@/lib/limits";
import { ToolError } from "@/lib/workers/errors";
import { countFrames } from "./animation";
import { hasTransparency } from "./pixels";

export type DecodedImage = {
  image: ImageData;
  format: DetectedFormat;
  /** Original file bytes (for frame counting and copying EXIF). */
  bytes: Uint8Array;
  frames: number;
  hasAlpha: boolean;
};

const NOT_YET: Partial<Record<DetectedFormat, string>> = {
  heic: "HEIC/HEIF photos can't be opened by this tool yet.",
  svg: "SVG files can't be opened by this tool yet.",
  pdf: "This is a PDF, not an image.",
};

function checkPixels(width: number, height: number) {
  if (width * height > MAX_IMAGE_PIXELS) {
    throw new ToolError(
      "IMAGE_TOO_LARGE",
      `This image is ${width} × ${height} (${Math.round((width * height) / 1e6)} MP), more than this device can process in the browser.`,
    );
  }
}

async function decodeWithBrowser(file: Blob): Promise<ImageData> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ToolError("CORRUPT_FILE");
  }
  try {
    checkPixels(bitmap.width, bitmap.height);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new ToolError("PROCESSING_FAILED", "This browser can't draw images inside workers.");
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export async function decodeImage(file: Blob): Promise<DecodedImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = sniffBytes(bytes.subarray(0, HEADER_BYTES));
  if (!format) throw new ToolError("UNSUPPORTED_FORMAT");
  const notYet = NOT_YET[format];
  if (notYet) throw new ToolError("UNSUPPORTED_FORMAT", notYet);

  const header = readDimensions(bytes.subarray(0, HEADER_BYTES), format);
  if (header) checkPixels(header.width, header.height);

  let image: ImageData;
  if (format === "tiff") {
    const { default: UTIF } = await import("utif");
    try {
      const ifds = UTIF.decode(bytes);
      if (!ifds.length) throw new Error("no pages");
      checkPixels(ifds[0].width, ifds[0].height);
      UTIF.decodeImage(bytes, ifds[0], ifds);
      const rgba = UTIF.toRGBA8(ifds[0]);
      image = new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), ifds[0].width, ifds[0].height);
    } catch (error) {
      if (error instanceof ToolError) throw error;
      throw new ToolError("CORRUPT_FILE", `This ${formatInfo.tiff.label} file couldn't be read.`);
    }
  } else {
    image = await decodeWithBrowser(file);
  }

  return {
    image,
    format,
    bytes,
    frames: countFrames(bytes, format),
    hasAlpha: format === "jpeg" ? false : hasTransparency(image),
  };
}
