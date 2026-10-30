"use client";

import { useRef, useState } from "react";
import { progressCallback, type ProgressCallback, type ProgressUpdate } from "@/lib/workers/client";
import { describeError } from "@/lib/workers/errors";

export type JobState<Result> =
  | { status: "idle" }
  | { status: "running"; progress: ProgressUpdate }
  | { status: "done"; result: Result }
  | { status: "error"; message: string };

/**
 * One file and one job at a time. Starting a new run makes older runs' results
 * and progress updates stale, so a slow earlier run can't overwrite a newer one.
 */
export function useFileJob<Result>() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<JobState<Result>>({ status: "idle" });
  const runId = useRef(0);

  async function run(task: (progress: ProgressCallback) => Promise<Result>) {
    const id = ++runId.current;
    const current = () => id === runId.current;
    setState({ status: "running", progress: { fraction: null, label: "Starting…" } });
    try {
      const result = await task(progressCallback((progress) => current() && setState({ status: "running", progress })));
      if (current()) setState({ status: "done", result });
    } catch (error) {
      if (current()) setState({ status: "error", message: describeError(error).message });
    }
  }

  /** Forgets the running job (the caller terminates the worker to actually stop it). */
  function cancel() {
    runId.current += 1;
    setState({ status: "idle" });
  }

  function reset() {
    runId.current += 1;
    setFile(null);
    setState({ status: "idle" });
  }

  return { file, setFile, state, run, cancel, reset };
}
