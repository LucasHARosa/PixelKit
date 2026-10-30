// Detects the real format from the first bytes, never from the extension.

export type DetectedFormat =
  | "png"
  | "jpeg"
  | "gif"
  | "webp"
  | "avif"
  | "heic"
  | "bmp"
  | "tiff"
  | "ico"
  | "svg"
  | "pdf";

export const formatInfo: Record<DetectedFormat, { label: string; mime: string; extension: string }> = {
  png: { label: "PNG", mime: "image/png", extension: "png" },
  jpeg: { label: "JPEG", mime: "image/jpeg", extension: "jpg" },
  gif: { label: "GIF", mime: "image/gif", extension: "gif" },
  webp: { label: "WebP", mime: "image/webp", extension: "webp" },
  avif: { label: "AVIF", mime: "image/avif", extension: "avif" },
  heic: { label: "HEIC/HEIF", mime: "image/heic", extension: "heic" },
  bmp: { label: "BMP", mime: "image/bmp", extension: "bmp" },
  tiff: { label: "TIFF", mime: "image/tiff", extension: "tiff" },
  ico: { label: "ICO", mime: "image/x-icon", extension: "ico" },
  svg: { label: "SVG", mime: "image/svg+xml", extension: "svg" },
  pdf: { label: "PDF", mime: "application/pdf", extension: "pdf" },
};

const HEAD_BYTES = 512;

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((value, i) => bytes[offset + i] === value);
}

export function sniffBytes(bytes: Uint8Array): DetectedFormat | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") return "gif";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "webp";
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") return "avif";
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) return "heic";
  }
  if (ascii(bytes, 0, 2) === "BM") return "bmp";
  if (startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return "tiff";
  if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00])) return "ico";
  if (ascii(bytes, 0, 5) === "%PDF-") return "pdf";

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, HEAD_BYTES)).trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(text)) return "svg";
  return null;
}

export async function sniffFile(file: Blob): Promise<DetectedFormat | null> {
  const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
  return sniffBytes(head);
}
