"use client";

import { FileImage, X } from "lucide-react";
import { Dropzone } from "@/components/tool/dropzone";
import { ErrorMessage } from "@/components/tool/error-message";
import { OptionsPanel } from "@/components/tool/options-panel";
import { ProgressBar } from "@/components/tool/progress-bar";
import type { JobState } from "@/components/tool/use-file-job";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";

export const IMAGE_ACCEPT = "image/*,.tif,.tiff,.ico,.bmp";
export const IMAGE_HINT = "PNG, JPEG, WebP, AVIF, GIF, BMP, TIFF, ICO";

type ImageToolShellProps<Result> = {
  file: File | null;
  state: JobState<Result>;
  /** Called with a newly chosen file. Tools start processing right away. */
  onFile: (file: File) => void;
  /** Runs again with the current options. */
  onRun: () => void;
  onCancel: () => void;
  onReset: () => void;
  actionLabel: string;
  options: React.ReactNode;
  renderResult: (file: File, result: Result) => React.ReactNode;
};

/** Shared layout of single-image tools: file and result on the left, options on the right. */
export function ImageToolShell<Result>({
  file,
  state,
  onFile,
  onRun,
  onCancel,
  onReset,
  actionLabel,
  options,
  renderResult,
}: ImageToolShellProps<Result>) {
  const running = state.status === "running";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-6" aria-live="polite">
        {!file ? (
          <Dropzone onFiles={([chosen]) => onFile(chosen)} accept={IMAGE_ACCEPT} hint={IMAGE_HINT} />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pl-4">
            <FileImage className="size-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} disabled={running}>
              <X data-icon="inline-start" aria-hidden />
              Change file
            </Button>
          </div>
        )}

        {state.status === "running" && (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
            <ProgressBar value={state.progress.fraction} label={state.progress.label} />
            <Button variant="outline" className="self-start" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}

        {state.status === "error" && <ErrorMessage message={state.message} onRetry={onReset} />}

        {state.status === "done" && file && renderResult(file, state.result)}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <OptionsPanel>{options}</OptionsPanel>
        <Button size="xl" onClick={onRun} disabled={!file || running}>
          {actionLabel}
        </Button>
      </aside>
    </div>
  );
}
