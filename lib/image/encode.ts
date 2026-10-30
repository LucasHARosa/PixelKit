// RGBA pixels → file bytes, inside a worker. Every codec is a WASM or JS module
// imported on first use, so the same output comes from every browser.

import { encodeBmp } from "./bmp";
import { quantize } from "./quantize";

export type OutputFormat = "png" | "jpeg" | "webp" | "avif" | "bmp" | "tiff" | "gif";

export const outputFormats: Record<OutputFormat, { label: string; mime: string; extension: string; alpha: boolean; lossy: boolean }> = {
  png: { label: "PNG", mime: "image/png", extension: "png", alpha: true, lossy: false },
  jpeg: { label: "JPEG", mime: "image/jpeg", extension: "jpg", alpha: false, lossy: true },
  webp: { label: "WebP", mime: "image/webp", extension: "webp", alpha: true, lossy: true },
  avif: { label: "AVIF", mime: "image/avif", extension: "avif", alpha: true, lossy: true },
  bmp: { label: "BMP", mime: "image/bmp", extension: "bmp", alpha: false, lossy: false },
  tiff: { label: "TIFF", mime: "image/tiff", extension: "tiff", alpha: true, lossy: false },
  gif: { label: "GIF", mime: "image/gif", extension: "gif", alpha: true, lossy: false },
};

export type EncodeOptions = {
  /** 1–100. */
  quality: number;
  /** WebP and AVIF: lossless encoding. PNG: skip the palette reduction. */
  lossless?: boolean;
  /** PNG: reduce to this many colors first (lossy PNG). */
  paletteColors?: number | null;
  /** PNG: run OxiPNG on the result (slower, smaller). */
  optimizePng?: boolean;
};

async function encodePng(image: ImageData, options: EncodeOptions): Promise<Uint8Array> {
  const source = options.paletteColors ? await quantize(image, options.paletteColors) : image;
  const { default: encode } = await import("@jsquash/png/encode.js");
  const png = new Uint8Array(await encode(source));
  if (!options.optimizePng) return png;
  // Single-threaded OxiPNG on purpose: the parallel build starts its own workers,
  // which Turbopack can't bundle (see DECISIONS W-018).
  const { default: init, optimise } = await import("@jsquash/oxipng/codec/pkg/squoosh_oxipng.js");
  await init();
  return optimise(png, 2, false, true);
}

let avifModule: Promise<{ encode: (data: Uint8Array, width: number, height: number, options: object) => Uint8Array | null }> | null = null;

async function encodeAvif(image: ImageData, options: EncodeOptions): Promise<Uint8Array> {
  // Single-threaded build: the multithreaded one hangs the build (DECISIONS W-018).
  avifModule ??= (async () => {
    const [{ default: factory }, { initEmscriptenModule }] = await Promise.all([
      import("@jsquash/avif/codec/enc/avif_enc.js"),
      import("@jsquash/avif/utils.js"),
    ]);
    return initEmscriptenModule(factory);
  })();
  const [{ defaultOptions }, avif] = await Promise.all([import("@jsquash/avif/meta.js"), avifModule]);
  const settings = options.lossless
    ? { ...defaultOptions, lossless: true, quality: 100, qualityAlpha: -1, subsample: 3, speed: 6 }
    : { ...defaultOptions, quality: options.quality, speed: 6 };
  const output = avif.encode(new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength), image.width, image.height, settings);
  if (!output) throw new Error("AVIF encoding failed");
  return new Uint8Array(output);
}

async function encodeGif(image: ImageData): Promise<Uint8Array> {
  const { GIFEncoder, quantize: gifQuantize, applyPalette } = await import("gifenc");
  const palette = gifQuantize(image.data, 256, { format: "rgba4444", oneBitAlpha: true });
  const transparentIndex = palette.findIndex((color) => color[3] === 0);
  const index = applyPalette(image.data, palette, "rgba4444");
  const gif = GIFEncoder();
  gif.writeFrame(index, image.width, image.height, {
    palette,
    transparent: transparentIndex >= 0,
    transparentIndex: Math.max(0, transparentIndex),
  });
  gif.finish();
  return gif.bytes();
}

export async function encodeImage(image: ImageData, format: OutputFormat, options: EncodeOptions): Promise<Uint8Array> {
  switch (format) {
    case "png":
      return encodePng(image, options);
    case "jpeg": {
      const { default: encode } = await import("@jsquash/jpeg/encode.js");
      return new Uint8Array(await encode(image, { quality: options.quality }));
    }
    case "webp": {
      const { default: encode } = await import("@jsquash/webp/encode.js");
      return new Uint8Array(
        await encode(image, options.lossless ? { lossless: 1, quality: 100, exact: 1 } : { quality: options.quality }),
      );
    }
    case "avif":
      return encodeAvif(image, options);
    case "bmp":
      return encodeBmp(image);
    case "tiff": {
      const { default: UTIF } = await import("utif");
      return new Uint8Array(UTIF.encodeImage(image.data, image.width, image.height));
    }
    case "gif":
      return encodeGif(image);
  }
}
