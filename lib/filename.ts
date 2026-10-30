// Download names built from untrusted file names (port of safe_filename from the
// Python version). Unlike the original, letters outside ASCII are kept: browsers
// save Unicode names fine, and folding "ação" to "acao" isn't needed here.

const UNSAFE_CHARS = /[^\p{L}\p{N}._ -]+/gu;
const MAX_STEM = 80;
const WINDOWS_RESERVED = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`),
]);

/** The original name without folders or extension, cleaned for use as a download name. */
export function safeStem(name: string | null | undefined, fallback = "image"): string {
  let stem = (name ?? "").replaceAll("\\", "/").split("/").pop() ?? "";
  const dot = stem.lastIndexOf(".");
  if (dot > 0) stem = stem.slice(0, dot);
  stem = stem
    .normalize("NFC")
    .replace(UNSAFE_CHARS, "-")
    .replace(/^[ .-]+|[ .-]+$/g, "");
  stem = Array.from(stem).slice(0, MAX_STEM).join("").replace(/[ .-]+$/g, "");
  if (!stem || WINDOWS_RESERVED.has(stem.toUpperCase())) return fallback;
  return stem;
}

/** `photo.HEIC` + `webp` → `photo.webp`. */
export function safeFilename(name: string | null | undefined, extension: string, fallback = "image"): string {
  return `${safeStem(name, fallback)}.${extension.replace(/^\./, "").toLowerCase()}`;
}
