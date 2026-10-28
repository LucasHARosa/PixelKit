"use client";

import { useEffect, useRef, useState } from "react";
import { probeMaxCanvas } from "@/lib/lab/canvas";
import type { AiDtype, LabResult, Row } from "@/lib/lab/types";
import { progressProxy, workers } from "@/lib/lab/workers";

type Inputs = { photo?: File; heic?: File };

type TestDef = {
  id: string;
  label: string;
  target: string;
  run: (inputs: Inputs, progress: (message: string) => void) => Promise<LabResult>;
};

type State = {
  status: "idle" | "running" | "done" | "error";
  message?: string;
  result?: LabResult;
  error?: string;
  previewUrl?: string;
};

const ISNET = "onnx-community/ISNet-ONNX";
const BIREFNET = "onnx-community/BiRefNet_lite-ONNX";

function aiTest(id: string, label: string, target: string, model: string, device: "webgpu" | "wasm", dtype: AiDtype): TestDef {
  return {
    id,
    label,
    target,
    run: (inputs, progress) =>
      workers.ai().removeBackground({ model, device, dtype, file: inputs.photo }, progressProxy(progress)),
  };
}

const TESTS: TestDef[] = [
  {
    id: "isolation",
    label: "crossOriginIsolated on this host",
    target: "true",
    run: async () => ({
      value: String(self.crossOriginIsolated),
      pass: self.crossOriginIsolated,
      details: { SharedArrayBuffer: typeof SharedArrayBuffer !== "undefined" },
    }),
  },
  aiTest("isnet-webgpu", "ISNet fp16 · WebGPU · 12 MP", "≤ 1500 ms", ISNET, "webgpu", "fp16"),
  aiTest("isnet-wasm", "ISNet uint8 · WASM (CPU) · 12 MP", "≤ 8000 ms", ISNET, "wasm", "uint8"),
  aiTest("birefnet-webgpu", "BiRefNet lite fp16 · WebGPU · 12 MP (quality mode, extra)", "≤ 1500 ms", BIREFNET, "webgpu", "fp16"),
  {
    id: "avif-6",
    label: "AVIF encode · 12 MP · speed 6",
    target: "≤ 6000 ms",
    run: (inputs, progress) => workers.avif().encode({ file: inputs.photo, quality: 50, speed: 6 }, progressProxy(progress)),
  },
  {
    id: "avif-8",
    label: "AVIF encode · 12 MP · speed 8",
    target: "≤ 6000 ms",
    run: (inputs, progress) => workers.avif().encode({ file: inputs.photo, quality: 50, speed: 8 }, progressProxy(progress)),
  },
  {
    id: "canvas",
    label: "Largest 2D canvas",
    target: "record",
    run: async () => probeMaxCanvas(),
  },
  {
    id: "mupdf",
    label: "MuPDF.js · render + redaction",
    target: "works",
    run: (_inputs, progress) => workers.pdf().redaction(progressProxy(progress)),
  },
  {
    id: "heic",
    label: "HEIC decode with libheif-js",
    target: "≤ 3000 ms (12 MP)",
    run: (inputs, progress) => {
      if (!inputs.heic) throw new Error("Choose a HEIC/HEIF file above first");
      return workers.heic().decode(inputs.heic, progressProxy(progress));
    },
  },
];

function formatDetails(details: Row): string {
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

export function Lab() {
  const [states, setStates] = useState<Record<string, State>>({});
  const [env, setEnv] = useState<Row>({});
  const [copied, setCopied] = useState(false);
  const inputs = useRef<Inputs>({});
  const previews = useRef<string[]>([]);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const base: Row = {
      userAgent: nav.userAgent,
      crossOriginIsolated: self.crossOriginIsolated,
      cpuThreads: nav.hardwareConcurrency,
      "deviceMemory (GB)": nav.deviceMemory ?? "n/a",
      devicePixelRatio: window.devicePixelRatio,
    };
    workers
      .ai()
      .gpuInfo()
      .then((gpu) => setEnv({ ...base, ...gpu }))
      .catch((error: unknown) => setEnv({ ...base, webgpu: `error: ${String(error)}` }));
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function update(id: string, patch: State) {
    setStates((current) => {
      const old = current[id]?.previewUrl;
      if (old && patch.previewUrl !== old && patch.status !== "running") URL.revokeObjectURL(old);
      return { ...current, [id]: patch };
    });
  }

  async function run(test: TestDef) {
    update(test.id, { status: "running", message: "Starting…" });
    try {
      const result = await test.run(inputs.current, (message) => update(test.id, { status: "running", message }));
      const previewUrl = result.preview ? URL.createObjectURL(result.preview) : undefined;
      if (previewUrl) previews.current.push(previewUrl);
      update(test.id, { status: "done", result, previewUrl });
    } catch (error) {
      update(test.id, { status: "error", error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function runAll() {
    for (const test of TESTS) {
      if (test.id === "heic" && !inputs.current.heic) continue;
      await run(test);
    }
  }

  async function copyMarkdown() {
    const lines = [
      "| Test | Target | Result | Pass | Details |",
      "|---|---|---|---|---|",
      ...TESTS.map((test) => {
        const state = states[test.id];
        const result = state?.result;
        const value = state?.status === "error" ? `error: ${state.error}` : (result?.value ?? "not run");
        const pass = result?.pass == null ? "—" : result.pass ? "✅" : "❌";
        return `| ${test.label} | ${test.target} | ${value} | ${pass} | ${result ? formatDetails(result.details) : ""} |`;
      }),
      "",
      `Environment: ${formatDetails(env)}`,
      `Input: ${inputs.current.photo ? `${inputs.current.photo.name} (${inputs.current.photo.size} bytes)` : "synthetic 4000×3000"}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const running = Object.values(states).some((state) => state.status === "running");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 text-sm">
      <h1 className="text-2xl font-semibold">W0 feasibility spike</h1>
      <p className="mt-2 text-neutral-600">
        Everything runs in this tab. Nothing you choose here is uploaded. Model and WASM downloads are listed in the
        Network panel.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Photo for AI and AVIF (optional, default: synthetic 12 MP)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => (inputs.current.photo = event.target.files?.[0])}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">HEIC/HEIF photo (required for the HEIC test)</span>
          <input
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            onChange={(event) => (inputs.current.heic = event.target.files?.[0])}
          />
        </label>
      </section>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={runAll}
          disabled={running}
          className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          Run all
        </button>
        <button type="button" onClick={copyMarkdown} className="rounded-md border border-neutral-300 px-4 py-2">
          {copied ? "Copied" : "Copy results as Markdown"}
        </button>
      </div>

      <section className="mt-6 flex flex-col gap-3" aria-live="polite">
        {TESTS.map((test) => {
          const state = states[test.id] ?? { status: "idle" };
          return (
            <article key={test.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">{test.label}</h2>
                  <p className="text-neutral-500">Target: {test.target}</p>
                </div>
                <button
                  type="button"
                  onClick={() => run(test)}
                  disabled={state.status === "running"}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
                >
                  {state.status === "running" ? "Running…" : "Run"}
                </button>
              </div>
              {state.status === "running" && <p className="mt-2 text-neutral-600">{state.message}</p>}
              {state.status === "error" && <p className="mt-2 text-red-700">Error: {state.error}</p>}
              {state.result && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <p className="font-mono text-base">
                      {state.result.value}{" "}
                      {state.result.pass != null && (state.result.pass ? "✅" : "❌")}
                    </p>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs text-neutral-600">
                      {Object.entries(state.result.details).map(([key, value]) => (
                        <div key={key} className="contents">
                          <dt>{key}</dt>
                          <dd className="break-all">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  {state.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={state.previewUrl} alt={`${test.label} result`} className="max-h-60 rounded border border-neutral-200" />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Environment</h2>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs text-neutral-600">
          {Object.entries(env).map(([key, value]) => (
            <div key={key} className="contents">
              <dt>{key}</dt>
              <dd className="break-all">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
