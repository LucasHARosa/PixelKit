"use client";

import { useState } from "react";
import { CheckboxField, NumberField, RangeField, SelectField } from "@/components/tool/fields";
import { ImageResultView } from "@/components/tool/image-result-view";
import { ImageToolShell } from "@/components/tool/image-tool-shell";
import { useFileJob } from "@/components/tool/use-file-job";
import type { CompressOptions, ImageResult } from "@/lib/image/operations";
import { imageWorker } from "@/lib/workers";

const DEFAULTS: CompressOptions = {
  format: "auto",
  quality: 80,
  lossless: false,
  maxWidth: null,
  maxHeight: null,
  keepMetadata: false,
};

const FORMATS: { value: CompressOptions["format"]; label: string }[] = [
  { value: "auto", label: "Same as original" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
];

export function CompressTool() {
  const job = useFileJob<ImageResult>();
  const [options, setOptions] = useState(DEFAULTS);
  const set = (patch: Partial<CompressOptions>) => setOptions((current) => ({ ...current, ...patch }));

  const losslessAllowed = options.format !== "jpeg";

  const run = (file: File) =>
    job.run((progress) =>
      imageWorker.get().compress(file, { ...options, lossless: losslessAllowed && options.lossless }, progress),
    );

  return (
    <ImageToolShell
      file={job.file}
      state={job.state}
      onFile={(file) => {
        job.setFile(file);
        run(file);
      }}
      onRun={() => job.file && run(job.file)}
      onCancel={() => {
        imageWorker.terminate();
        job.cancel();
      }}
      onReset={job.reset}
      actionLabel="Compress"
      options={
        <>
          <SelectField label="Output format" value={options.format} options={FORMATS} onChange={(format) => set({ format })} />
          <RangeField
            label="Quality"
            value={options.quality}
            min={1}
            max={100}
            onChange={(quality) => set({ quality })}
            hint={
              options.format === "png" || options.format === "auto"
                ? "For PNG, quality sets the number of colors (80 → 205 colors)."
                : "Lower means smaller files and more visible artifacts."
            }
          />
          <CheckboxField
            label="Lossless"
            hint="PNG: only optimize, keep every color. WebP and AVIF: no quality loss. Not available for JPEG."
            checked={losslessAllowed && options.lossless}
            disabled={!losslessAllowed}
            onChange={(lossless) => set({ lossless })}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Max width" placeholder="Any" value={options.maxWidth} onChange={(maxWidth) => set({ maxWidth })} />
            <NumberField label="Max height" placeholder="Any" value={options.maxHeight} onChange={(maxHeight) => set({ maxHeight })} />
          </div>
          <CheckboxField
            label="Keep metadata"
            hint="JPEG to JPEG only. Off by default: camera details and GPS location are removed."
            checked={options.keepMetadata}
            onChange={(keepMetadata) => set({ keepMetadata })}
          />
        </>
      }
      renderResult={(file, result) => <ImageResultView original={file} result={result} emphasizeSize />}
    />
  );
}
