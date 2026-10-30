// Compress, resize and convert: decode → transform → encode, with the same
// warnings as the Python version. Runs inside the image worker.

import { formatInfo, type DetectedFormat } from "@/lib/codecs/sniff";
import type { ProgressCallback } from "@/lib/workers/client";
import { ToolError } from "@/lib/workers/errors";
import type { WarningCode } from "@/lib/warnings";
import { decodeImage, type DecodedImage } from "./decode";
import { encodeImage, outputFormats, type OutputFormat } from "./encode";
import { copyJpegExif } from "./exif";
import { computeGeometry, isUpscaled, type Fit } from "./geometry";
import { paletteColors } from "./quantize";
import { centerCrop, flatten, parseHexColor } from "./pixels";
import { resizeImage, type ResampleMethod } from "./resample";

export type ImageResult = {
  blob: Blob;
  extension: string;
  inputFormat: string;
  outputFormat: string;
  inputSize: number;
  outputSize: number;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  warnings: WarningCode[];
};

export type CompressOptions = {
  /** "auto" keeps the input format (JPEG, PNG, WebP, AVIF only). */
  format: "auto" | "jpeg" | "png" | "webp" | "avif";
  quality: number;
  lossless: boolean;
  maxWidth: number | null;
  maxHeight: number | null;
  keepMetadata: boolean;
};

export type ResizeOptions = {
  width: number | null;
  height: number | null;
  fit: Fit;
  allowUpscale: boolean;
  method: ResampleMethod;
  format: "auto" | OutputFormat;
  quality: number;
  background: string;
  keepMetadata: boolean;
};

export type ConvertOptions = {
  target: OutputFormat;
  quality: number;
  lossless: boolean;
  background: string;
  keepMetadata: boolean;
};

const ENCODABLE: OutputFormat[] = ["png", "jpeg", "webp", "avif", "bmp", "tiff", "gif"];

function inputAsOutput(format: DetectedFormat): OutputFormat | null {
  return (ENCODABLE as string[]).includes(format) ? (format as OutputFormat) : null;
}

type Step = { decoded: DecodedImage; image: ImageData; warnings: Set<WarningCode> };

function start(decoded: DecodedImage): Step {
  const warnings = new Set<WarningCode>();
  if (decoded.frames > 1) warnings.add("ANIMATION_FIRST_FRAME_ONLY");
  return { decoded, image: decoded.image, warnings };
}

/** Fills transparency for formats without alpha, and records the warning. */
function prepareAlpha(step: Step, target: OutputFormat, background: string) {
  if (!outputFormats[target].alpha && step.decoded.hasAlpha) {
    step.image = flatten(step.image, parseHexColor(background));
    step.warnings.add("ALPHA_FLATTENED");
  }
}

async function finish(
  step: Step,
  file: Blob,
  target: OutputFormat,
  encoded: Uint8Array,
  keepMetadata: boolean,
): Promise<ImageResult> {
  let bytes = encoded;
  if (keepMetadata && target === "jpeg" && step.decoded.format === "jpeg") {
    bytes = await copyJpegExif(step.decoded.bytes, bytes);
  }
  const info = outputFormats[target];
  return {
    blob: new Blob([bytes.slice()], { type: info.mime }),
    extension: info.extension,
    inputFormat: formatInfo[step.decoded.format].label,
    outputFormat: info.label,
    inputSize: file.size,
    outputSize: bytes.byteLength,
    inputWidth: step.decoded.image.width,
    inputHeight: step.decoded.image.height,
    outputWidth: step.image.width,
    outputHeight: step.image.height,
    warnings: [...step.warnings],
  };
}

export async function compress(file: Blob, options: CompressOptions, progress: ProgressCallback): Promise<ImageResult> {
  progress({ fraction: null, label: "Reading image…" });
  const step = start(await decodeImage(file));

  const target = options.format === "auto" ? inputAsOutput(step.decoded.format) : options.format;
  if (!target || !["jpeg", "png", "webp", "avif"].includes(target)) {
    throw new ToolError("INVALID_OPTION", `Choose an output format: ${formatInfo[step.decoded.format].label} can't be compressed as-is.`);
  }

  if (options.maxWidth || options.maxHeight) {
    const geometry = computeGeometry(step.image, { width: options.maxWidth, height: options.maxHeight, fit: "contain" });
    if (geometry.size.width !== step.image.width || geometry.size.height !== step.image.height) {
      progress({ fraction: null, label: "Resizing…" });
      step.image = await resizeImage(step.image, geometry.size.width, geometry.size.height, "lanczos");
    }
  }
  prepareAlpha(step, target, "#ffffff");

  const lossyPng = target === "png" && !options.lossless;
  progress({ fraction: null, label: lossyPng ? "Reducing colors…" : `Encoding ${outputFormats[target].label}…` });
  const encoded = await encodeImage(step.image, target, {
    quality: options.quality,
    lossless: options.lossless,
    paletteColors: lossyPng ? paletteColors(options.quality) : null,
    optimizePng: true,
  });

  const result = await finish(step, file, target, encoded, options.keepMetadata);
  if (result.outputSize >= result.inputSize) result.warnings.push("NO_SIZE_REDUCTION");
  return result;
}

export async function resize(file: Blob, options: ResizeOptions, progress: ProgressCallback): Promise<ImageResult> {
  if (!options.width && !options.height) throw new ToolError("INVALID_OPTION", "Enter a width, a height, or both.");
  progress({ fraction: null, label: "Reading image…" });
  const step = start(await decodeImage(file));

  const target = options.format === "auto" ? inputAsOutput(step.decoded.format) ?? "png" : options.format;
  const source = { width: step.image.width, height: step.image.height };
  const geometry = computeGeometry(source, options);
  if (isUpscaled(source, geometry)) step.warnings.add("UPSCALED");

  progress({ fraction: null, label: "Resizing…" });
  step.image = await resizeImage(step.image, geometry.size.width, geometry.size.height, options.method);
  if (geometry.crop) step.image = centerCrop(step.image, geometry.crop.width, geometry.crop.height);
  prepareAlpha(step, target, options.background);

  progress({ fraction: null, label: `Encoding ${outputFormats[target].label}…` });
  const encoded = await encodeImage(step.image, target, { quality: options.quality });
  return finish(step, file, target, encoded, options.keepMetadata);
}

export async function convert(file: Blob, options: ConvertOptions, progress: ProgressCallback): Promise<ImageResult> {
  progress({ fraction: null, label: "Reading image…" });
  const step = start(await decodeImage(file));
  prepareAlpha(step, options.target, options.background);

  progress({ fraction: null, label: `Encoding ${outputFormats[options.target].label}…` });
  const encoded = await encodeImage(step.image, options.target, { quality: options.quality, lossless: options.lossless });
  return finish(step, file, options.target, encoded, options.keepMetadata);
}
