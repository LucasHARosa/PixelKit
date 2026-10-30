import * as Comlink from "comlink";

/**
 * A worker created on first use. `create` must contain the literal
 * `new Worker(new URL("./x.worker.ts", import.meta.url), { type: "module" })`
 * so the bundler can find and bundle the worker file.
 */
export function lazyWorker<Api>(create: () => Worker) {
  let worker: Worker | null = null;
  let remote: Comlink.Remote<Api> | null = null;

  return {
    get(): Comlink.Remote<Api> {
      if (!remote) {
        worker = create();
        remote = Comlink.wrap<Api>(worker);
      }
      return remote;
    },
    /** Stops the worker (frees its memory, cancels running work). The next `get()` starts a new one. */
    terminate() {
      remote?.[Comlink.releaseProxy]();
      worker?.terminate();
      worker = null;
      remote = null;
    },
  };
}

export type ProgressUpdate = {
  /** 0–1, or null when the step has no measurable progress. */
  fraction: number | null;
  label: string;
};

export type ProgressCallback = (update: ProgressUpdate) => void;

/** Wraps a callback so a worker can call it across the thread boundary. */
export function progressCallback(fn: ProgressCallback): ProgressCallback {
  return Comlink.proxy(fn);
}
