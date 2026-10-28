/// <reference lib="webworker" />
import * as Comlink from "comlink";
import type { LabResult, Progress } from "./types";
import { previewPng } from "./sample";

const TARGET_MS = 3000;

type HeifImage = {
  get_width(): number;
  get_height(): number;
  display(target: { data: Uint8ClampedArray; width: number; height: number }, done: (result: unknown) => void): void;
  free?: () => void;
};
type LibHeif = { HeifDecoder: new () => { decode(data: Uint8Array): HeifImage[] } };

let libheif: Promise<LibHeif> | null = null;

function loadLibheif(): Promise<LibHeif> {
  libheif ??= import("libheif-js/libheif-wasm/libheif-bundle.mjs").then(async ({ default: factory }) => {
    const lib = (await factory()) as LibHeif & { ready?: Promise<unknown> };
    if (lib.ready) await lib.ready;
    return lib;
  });
  return libheif;
}

const api = {
  async decode(file: Blob, progress: Progress): Promise<LabResult> {
    progress("Loading libheif…");
    const t0 = performance.now();
    const lib = await loadLibheif();
    const initMs = performance.now() - t0;

    const bytes = new Uint8Array(await file.arrayBuffer());
    progress("Decoding…");
    const t = performance.now();
    const images = new lib.HeifDecoder().decode(bytes);
    if (!images.length) throw new Error("No image found in this HEIC/HEIF file");
    const image = images[0];
    const width = image.get_width();
    const height = image.get_height();
    const data = new Uint8ClampedArray(width * height * 4);
    await new Promise<void>((resolve, reject) => {
      image.display({ data, width, height }, (result) => (result ? resolve() : reject(new Error("HEIF decode failed"))));
    });
    const decodeMs = performance.now() - t;
    const preview = await previewPng(data, width, height);
    for (const img of images) img.free?.();

    return {
      value: `${Math.round(decodeMs)} ms`,
      pass: decodeMs <= TARGET_MS,
      preview,
      details: {
        size: `${width}×${height}`,
        megapixels: Math.round((width * height) / 1e5) / 10,
        "images in file": images.length,
        "file (KB)": Math.round(file.size / 1024),
        "libheif init (ms)": Math.round(initMs),
        "target (ms)": TARGET_MS,
      },
    };
  },
};

export type HeicWorkerApi = typeof api;
Comlink.expose(api);
