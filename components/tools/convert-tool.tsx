"use client";

import { useState } from "react";
import { CheckboxField, ColorField, RangeField, SelectField } from "@/components/tool/fields";
import { ImageResultView } from "@/components/tool/image-result-view";
import { ImageToolShell } from "@/components/tool/image-tool-shell";
import { useFileJob } from "@/components/tool/use-file-job";
import { outputFormats, type OutputFormat } from "@/lib/image/encode";
import type { ConvertOptions, ImageResult } from "@/lib/image/operations";
import { imageWorker } from "@/lib/workers";

const DEFAULTS: ConvertOptions = {
  target: "webp",
  quality: 90,
  lossless: false,
  background: "#ffffff",
  keepMetadata: false,
};

const TARGETS = (Object.keys(outputFormats) as OutputFormat[]).map((value) => ({
  value,
  label: outputFormats[value].label,
}));

export function ConvertTool() {
  const job = useFileJob<ImageResult>();
  const [options, setOptions] = useState(DEFAULTS);
  const set = (patch: Partial<ConvertOptions>) => setOptions((current) => ({ ...current, ...patch }));
  const target = outputFormats[options.target];
  const losslessAllowed = options.target === "webp" || options.target === "avif";

  const run = (file: File) =>
    job.run((progress) =>
      imageWorker.get().convert(file, { ...options, lossless: losslessAllowed && options.lossless }, progress),
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
      actionLabel={`Convert to ${target.label}`}
      options={
        <>
          <SelectField label="Convert to" value={options.target} options={TARGETS} onChange={(value) => set({ target: value })} />
          {target.lossy && (
            <RangeField label="Quality" value={options.quality} min={1} max={100} onChange={(quality) => set({ quality })} />
          )}
          {losslessAllowed && (
            <CheckboxField label="Lossless" checked={options.lossless} onChange={(lossless) => set({ lossless })} />
          )}
          {!target.alpha && (
            <ColorField
              label="Background"
              hint={`${target.label} has no transparency: transparent areas get this color.`}
              value={options.background}
              onChange={(background) => set({ background })}
            />
          )}
          {options.target === "gif" && (
            <p className="text-xs text-muted-foreground">GIF uses at most 256 colors. Photos will show banding.</p>
          )}
          {options.target === "jpeg" && (
            <CheckboxField
              label="Keep metadata"
              hint="Only when the original is also JPEG."
              checked={options.keepMetadata}
              onChange={(keepMetadata) => set({ keepMetadata })}
            />
          )}
        </>
      }
      renderResult={(file, result) => <ImageResultView original={file} result={result} />}
    />
  );
}
