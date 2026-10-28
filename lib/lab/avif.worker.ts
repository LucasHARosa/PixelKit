/// <reference lib="webworker" />
import * as Comlink from "comlink";
import type { LabResult, Progress } from "./types";
import { loadPixels, wasmTransfer } from "./sample";

const TARGET_MS = 6000;

const api = {
  async encode(options: { file?: Blob; quality: number; speed: number }, progress: Progress): Promise<LabResult> {
    progress("Loading AVIF encoder…");
    const t0 = performance.now();
    const { default: encode, init } = await import("@jsquash/avif/encode.js");
    await init();
    const initMs = performance.now() - t0;

    progress("Decoding input…");
    const pixels = await loadPixels(options.file);

    progress(`Encoding (quality ${options.quality}, speed ${options.speed})…`);
    const t = performance.now();
    const output = await encode(pixels, { quality: options.quality, speed: options.speed });
    const encodeMs = performance.now() - t;

    return {
      value: `${Math.round(encodeMs)} ms`,
      pass: encodeMs <= TARGET_MS,
      details: {
        input: `${pixels.width}×${pixels.height}`,
        quality: options.quality,
        speed: options.speed,
        "output (KB)": Math.round(output.byteLength / 1024),
        "encoder init (ms)": Math.round(initMs),
        "target (ms)": TARGET_MS,
        multithreaded: self.crossOriginIsolated && typeof SharedArrayBuffer !== "undefined",
        "wasm (KB transferred)": wasmTransfer(/avif_enc/).map((f) => `${f.name}: ${f.transferKB}`).join(", ") || "from cache",
      },
    };
  },
};

export type AvifWorkerApi = typeof api;
Comlink.expose(api);
