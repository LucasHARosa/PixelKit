import * as Comlink from "comlink";
import type { AiWorkerApi } from "./ai.worker";
import type { AvifWorkerApi } from "./avif.worker";
import type { HeicWorkerApi } from "./heic.worker";
import type { PdfWorkerApi } from "./pdf.worker";

// One lazily created worker per library, so a crash in one doesn't affect the others
// and nothing heavy is fetched until its test runs.
let ai: Comlink.Remote<AiWorkerApi> | null = null;
let avif: Comlink.Remote<AvifWorkerApi> | null = null;
let heic: Comlink.Remote<HeicWorkerApi> | null = null;
let pdf: Comlink.Remote<PdfWorkerApi> | null = null;

export const workers = {
  ai: () => (ai ??= Comlink.wrap<AiWorkerApi>(new Worker(new URL("./ai.worker.ts", import.meta.url), { type: "module" }))),
  avif: () =>
    (avif ??= Comlink.wrap<AvifWorkerApi>(new Worker(new URL("./avif.worker.ts", import.meta.url), { type: "module" }))),
  heic: () =>
    (heic ??= Comlink.wrap<HeicWorkerApi>(new Worker(new URL("./heic.worker.ts", import.meta.url), { type: "module" }))),
  pdf: () => (pdf ??= Comlink.wrap<PdfWorkerApi>(new Worker(new URL("./pdf.worker.ts", import.meta.url), { type: "module" }))),
};

export const progressProxy = (fn: (message: string) => void) => Comlink.proxy(fn);
