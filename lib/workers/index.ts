import { lazyWorker } from "./client";
import type { ImageWorkerApi } from "./image.worker";

// One worker per library family (docs/DECISIONS.md W-010). Each is created on first
// use, so pages that don't need it never download its code.
export const imageWorker = lazyWorker<ImageWorkerApi>(
  () => new Worker(new URL("./image.worker.ts", import.meta.url), { type: "module" }),
);
