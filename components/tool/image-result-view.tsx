"use client";

import { BeforeAfter } from "@/components/tool/before-after";
import { DownloadButton } from "@/components/tool/download-button";
import { FileDetails, type Detail } from "@/components/tool/file-details";
import { WarningList } from "@/components/tool/warning-list";
import { safeFilename } from "@/lib/filename";
import { formatBytes, formatDimensions } from "@/lib/format";
import { useObjectUrl } from "@/lib/hooks/use-object-url";
import type { ImageResult } from "@/lib/image/operations";
import { cn } from "@/lib/utils";

/** Output formats every target browser can show in an <img>. */
const PREVIEWABLE = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif", "image/bmp"]);

function change(before: number, after: number): string {
  if (before === 0) return "";
  const percent = ((after - before) / before) * 100;
  const rounded = Math.abs(percent) < 0.1 ? "0" : percent.toFixed(1);
  return `${percent > 0 ? "+" : ""}${rounded}%`;
}

type ImageResultViewProps = {
  original: File;
  result: ImageResult;
  /** Show the size reduction as the headline number (compress). */
  emphasizeSize?: boolean;
};

export function ImageResultView({ original, result, emphasizeSize = false }: ImageResultViewProps) {
  const beforeUrl = useObjectUrl(original);
  const afterUrl = useObjectUrl(result.blob);
  const canPreview = PREVIEWABLE.has(result.blob.type);
  const sameSize = result.inputWidth === result.outputWidth && result.inputHeight === result.outputHeight;
  const reduction = result.inputSize > 0 ? (1 - result.outputSize / result.inputSize) * 100 : 0;

  const details: Detail[] = [
    {
      label: "Format",
      value: result.inputFormat === result.outputFormat ? result.outputFormat : `${result.inputFormat} → ${result.outputFormat}`,
    },
    {
      label: "Dimensions",
      value: sameSize
        ? `${formatDimensions(result.outputWidth, result.outputHeight)} px`
        : `${formatDimensions(result.inputWidth, result.inputHeight)} → ${formatDimensions(result.outputWidth, result.outputHeight)} px`,
    },
    {
      label: "File size",
      value: `${formatBytes(result.inputSize)} → ${formatBytes(result.outputSize)} (${change(result.inputSize, result.outputSize)})`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {emphasizeSize && (
        <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card">
          {[
            { label: "Original", value: formatBytes(result.inputSize) },
            { label: "Result", value: formatBytes(result.outputSize) },
            {
              label: reduction > 0 ? "Saved" : "Change",
              value: reduction > 0 ? `${reduction.toFixed(1)}%` : change(result.inputSize, result.outputSize),
            },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col gap-1 p-4 sm:p-5">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              <span className={cn("font-mono text-xl sm:text-2xl", i === 2 && reduction > 0 && "text-success")}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {canPreview && beforeUrl && afterUrl ? (
        sameSize ? (
          <BeforeAfter beforeSrc={beforeUrl} afterSrc={afterUrl} beforeLabel="Original" afterLabel="Result" checkerboard />
        ) : (
          <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-checkerboard p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
            <img src={afterUrl} alt="Result preview" decoding="async" className="max-h-112 w-auto object-contain" />
          </div>
        )
      ) : (
        !canPreview && (
          <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Browsers can&apos;t preview {result.outputFormat} files. The download is ready below.
          </p>
        )
      )}

      <WarningList warnings={result.warnings} />

      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-end sm:justify-between">
        <FileDetails details={details} />
        <DownloadButton blob={result.blob} filename={safeFilename(original.name, result.extension)} />
      </div>
    </div>
  );
}
