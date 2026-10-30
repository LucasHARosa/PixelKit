"use client";

import { useState } from "react";
import { CheckboxField, ColorField, NumberField, RangeField, SegmentedField, SelectField } from "@/components/tool/fields";
import { ImageResultView } from "@/components/tool/image-result-view";
import { ImageToolShell } from "@/components/tool/image-tool-shell";
import { useFileJob } from "@/components/tool/use-file-job";
import type { ImageResult, ResizeOptions } from "@/lib/image/operations";
import { imageWorker } from "@/lib/workers";

const DEFAULTS: ResizeOptions = {
  width: 1200,
  height: null,
  fit: "contain",
  allowUpscale: false,
  method: "lanczos",
  format: "auto",
  quality: 90,
  background: "#ffffff",
  keepMetadata: false,
};

const FITS: { value: ResizeOptions["fit"]; label: string }[] = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
];

const FIT_HINTS: Record<ResizeOptions["fit"], string> = {
  contain: "Fits inside the box, keeping the proportions.",
  cover: "Fills the box, keeping the proportions, and crops the overflow from the center.",
  fill: "Stretches to exactly the box. Proportions may change.",
};

const METHODS: { value: ResizeOptions["method"]; label: string }[] = [
  { value: "lanczos", label: "Lanczos (sharpest)" },
  { value: "bicubic", label: "Bicubic" },
  { value: "bilinear", label: "Bilinear" },
  { value: "nearest", label: "Nearest (pixel art)" },
];

const FORMATS: { value: ResizeOptions["format"]; label: string }[] = [
  { value: "auto", label: "Same as original" },
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
];

export function ResizeTool() {
  const job = useFileJob<ImageResult>();
  const [options, setOptions] = useState(DEFAULTS);
  const set = (patch: Partial<ResizeOptions>) => setOptions((current) => ({ ...current, ...patch }));
  const bothSides = Boolean(options.width && options.height);
  const lossy = options.format === "jpeg" || options.format === "webp" || options.format === "avif" || options.format === "auto";

  const run = (file: File) => job.run((progress) => imageWorker.get().resize(file, options, progress));

  return (
    <ImageToolShell
      file={job.file}
      state={job.state}
      onFile={(file) => {
        job.setFile(file);
        if (options.width || options.height) run(file);
      }}
      onRun={() => job.file && run(job.file)}
      onCancel={() => {
        imageWorker.terminate();
        job.cancel();
      }}
      onReset={job.reset}
      actionLabel="Resize"
      options={
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Width" placeholder="Auto" value={options.width} onChange={(width) => set({ width })} />
            <NumberField label="Height" placeholder="Auto" value={options.height} onChange={(height) => set({ height })} />
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            {bothSides ? "Both sides set: choose how the image fits the box." : "One side set: the other follows the proportions."}
          </p>
          {bothSides && (
            <SegmentedField label="Fit" value={options.fit} options={FITS} onChange={(fit) => set({ fit })} hint={FIT_HINTS[options.fit]} />
          )}
          <CheckboxField
            label="Allow enlarging"
            hint="Off: an image smaller than the target keeps its size."
            checked={options.allowUpscale}
            onChange={(allowUpscale) => set({ allowUpscale })}
          />
          <SelectField label="Resampling" value={options.method} options={METHODS} onChange={(method) => set({ method })} />
          <SelectField label="Output format" value={options.format} options={FORMATS} onChange={(format) => set({ format })} />
          {lossy && (
            <RangeField label="Quality" value={options.quality} min={1} max={100} onChange={(quality) => set({ quality })} hint="Used by JPEG, WebP and AVIF." />
          )}
          <ColorField
            label="Background"
            hint="Fills transparent areas when the format has no transparency (JPEG, BMP)."
            value={options.background}
            onChange={(background) => set({ background })}
          />
          <CheckboxField
            label="Keep metadata"
            hint="JPEG to JPEG only."
            checked={options.keepMetadata}
            onChange={(keepMetadata) => set({ keepMetadata })}
          />
        </>
      }
      renderResult={(file, result) => <ImageResultView original={file} result={result} />}
    />
  );
}
