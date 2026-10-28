/// <reference lib="webworker" />
import * as Comlink from "comlink";
import type { AiOptions, LabResult, Progress } from "./types";
import { loadPixels, previewPng, wasmTransfer } from "./sample";

type Segmenter = (input: unknown) => Promise<{ data: Uint8ClampedArray; width: number; height: number }>;
type Loaded = { key: string; run: Segmenter; dispose: () => Promise<void> };

let loaded: Loaded | null = null;

async function gpuInfo() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<GPUAdapterLike | null> } }).gpu;
  if (!gpu) return { webgpu: false };
  const adapter = await gpu.requestAdapter();
  if (!adapter) return { webgpu: false, reason: "no adapter" };
  return {
    webgpu: true,
    vendor: adapter.info?.vendor ?? "",
    architecture: adapter.info?.architecture ?? "",
    shaderF16: adapter.features.has("shader-f16"),
  };
}

type GPUAdapterLike = { info?: { vendor?: string; architecture?: string }; features: Set<string> };

const api = {
  async gpuInfo() {
    return gpuInfo();
  },

  async removeBackground(options: AiOptions, progress: Progress): Promise<LabResult> {
    const { pipeline, env, RawImage } = await import("@huggingface/transformers");
    env.allowLocalModels = false;
    // Serve the ONNX Runtime WASM from this site instead of cdn.jsdelivr.net.
    const origin = self.location.origin;
    env.backends.onnx.wasm!.wasmPaths = {
      mjs: `${origin}/ort/ort-wasm-simd-threaded.asyncify.mjs`,
      wasm: `${origin}/ort/ort-wasm-simd-threaded.asyncify.wasm`,
    };

    const key = `${options.model}|${options.device}|${options.dtype}`;
    let loadMs = 0;
    if (loaded?.key !== key) {
      if (loaded) await loaded.dispose();
      loaded = null;
      progress(`Loading ${options.model} (${options.dtype}, ${options.device})…`);
      const t0 = performance.now();
      const segmenter = await pipeline("background-removal", options.model, {
        device: options.device,
        dtype: options.dtype,
        progress_callback: (info) => {
          if (info.status === "progress_total") progress(`Downloading model: ${Math.round(info.progress)}%`);
        },
      });
      loadMs = performance.now() - t0;
      loaded = {
        key,
        run: segmenter as unknown as Segmenter,
        dispose: () => segmenter.dispose(),
      };
    }

    progress("Decoding input…");
    const pixels = await loadPixels(options.file);
    const input = new RawImage(pixels.data, pixels.width, pixels.height, 4);

    progress("Run 1 (includes warm-up)…");
    let t = performance.now();
    await loaded.run(input);
    const firstMs = performance.now() - t;

    progress("Run 2…");
    t = performance.now();
    const output = await loaded.run(input);
    const secondMs = performance.now() - t;

    const preview = await previewPng(output.data, output.width, output.height);
    const target = options.device === "webgpu" ? 1500 : 8000;
    const ort = wasmTransfer(/ort-wasm/);

    return {
      value: `${Math.round(secondMs)} ms`,
      pass: secondMs <= target,
      preview,
      details: {
        model: options.model,
        device: options.device,
        dtype: options.dtype,
        input: `${pixels.width}×${pixels.height}`,
        "model load (ms)": loadMs ? Math.round(loadMs) : "cached in worker",
        "run 1 (ms)": Math.round(firstMs),
        "run 2 (ms)": Math.round(secondMs),
        "target (ms)": target,
        crossOriginIsolated: self.crossOriginIsolated,
        threads: env.backends.onnx.wasm?.numThreads ?? "default",
        "ORT wasm (KB transferred)": ort.map((f) => `${f.name}: ${f.transferKB}`).join(", ") || "from cache",
      },
    };
  },
};

export type AiWorkerApi = typeof api;
Comlink.expose(api);
