"use client";

import { useEffect, useState } from "react";
import { Dropzone } from "@/components/tool/dropzone";
import { ErrorMessage } from "@/components/tool/error-message";
import { FileDetails, type Detail } from "@/components/tool/file-details";
import { ProgressBar } from "@/components/tool/progress-bar";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDimensions, formatMegapixels } from "@/lib/format";
import { imageWorker } from "@/lib/workers";
import { describeError } from "@/lib/workers/errors";
import type { ImageInfo } from "@/lib/workers/image.worker";

type State =
  | { status: "empty" }
  | { status: "processing"; file: File }
  | { status: "result"; file: File; info: ImageInfo; previewUrl: string | null }
  | { status: "error"; file: File; message: string };

const ACCEPT = "image/*,.heic,.heif,.ico,.svg";

const EXTENSIONS: Record<ImageInfo["format"], string[]> = {
  png: ["png", "apng"],
  jpeg: ["jpg", "jpeg", "jpe", "jfif"],
  gif: ["gif"],
  webp: ["webp"],
  avif: ["avif"],
  heic: ["heic", "heif", "hif"],
  bmp: ["bmp", "dib"],
  tiff: ["tif", "tiff"],
  ico: ["ico", "cur"],
  svg: ["svg"],
  pdf: ["pdf"],
};

function detailsFor(file: File, info: ImageInfo): Detail[] {
  const details: Detail[] = [
    { label: "Name", value: file.name },
    { label: "Format", value: `${info.formatLabel} (${info.mime})` },
    { label: "File size", value: `${formatBytes(info.size)} (${info.size.toLocaleString("en-US")} bytes)` },
  ];
  if (info.width != null && info.height != null) {
    details.push({ label: "Dimensions", value: `${formatDimensions(info.width, info.height)} px` });
    details.push({ label: "Megapixels", value: formatMegapixels(info.width, info.height) });
  }
  if (info.hasAlpha != null) {
    details.push({ label: "Transparency", value: info.hasAlpha ? "Yes" : "No" });
  }
  if (info.frames > 1) {
    details.push({ label: "Animation", value: `${info.frames} frames` });
  }
  if (info.exif?.orientation && info.exif.orientation !== 1) {
    details.push({ label: "Orientation", value: `EXIF ${info.exif.orientation} (shown upright, as cameras intend)` });
  }
  if (info.tooLarge) {
    details.push({ label: "Note", value: "Too large to open in the browser. Size read from the file header." });
  }
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
  if (extension && !EXTENSIONS[info.format].includes(extension)) {
    details.push({ label: "Extension", value: `.${extension}, but the file is really ${info.formatLabel}` });
  }
  return details;
}

function ExifSection({ exif }: { exif: NonNullable<ImageInfo["exif"]> }) {
  const summary: Detail[] = [
    exif.camera && { label: "Camera", value: exif.camera },
    exif.lens && { label: "Lens", value: exif.lens },
    exif.takenAt && { label: "Taken", value: exif.takenAt },
    exif.exposure && { label: "Exposure", value: exif.exposure },
    exif.software && { label: "Software", value: exif.software },
  ].filter((detail): detail is Detail => Boolean(detail));
  const tagCount = Object.keys(exif.tags).length;
  if (summary.length === 0 && !exif.gps && tagCount === 0) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Metadata (EXIF)</h2>
      {exif.gps && (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-highlight/40 p-3 text-sm">
          <p className="font-medium">This photo contains its GPS location.</p>
          <p className="font-mono">
            {exif.gps.latitude.toFixed(6)}, {exif.gps.longitude.toFixed(6)}
          </p>
          <p>
            Compress, Resize and Convert remove it unless you choose to keep metadata.{" "}
            <a
              href={`https://www.openstreetmap.org/?mlat=${exif.gps.latitude}&mlon=${exif.gps.longitude}#map=15/${exif.gps.latitude}/${exif.gps.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Open in OpenStreetMap
            </a>
          </p>
        </div>
      )}
      {summary.length > 0 && <FileDetails details={summary} />}
      {tagCount > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">All tags ({tagCount})</summary>
          <FileDetails
            className="mt-3 text-xs"
            details={Object.entries(exif.tags).map(([label, value]) => ({ label, value }))}
          />
        </details>
      )}
    </section>
  );
}

export function ImageInfoTool() {
  const [state, setState] = useState<State>({ status: "empty" });

  const previewUrl = state.status === "result" ? state.previewUrl : null;
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function inspect(file: File) {
    setState({ status: "processing", file });
    try {
      const info = await imageWorker.get().inspect(file);
      // hasAlpha is only set when the worker decoded the image, i.e. the browser can show it.
      const preview = info.hasAlpha !== null ? URL.createObjectURL(file) : null;
      setState({ status: "result", file, info, previewUrl: preview });
    } catch (error) {
      setState({ status: "error", file, message: describeError(error).message });
    }
  }

  const reset = () => setState({ status: "empty" });

  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      {state.status === "empty" && (
        <Dropzone onFiles={([file]) => inspect(file)} accept={ACCEPT} hint="PNG, JPEG, WebP, AVIF, GIF, BMP, ICO, HEIC, TIFF, SVG" />
      )}

      {state.status === "processing" && <ProgressBar value={null} label={`Reading ${state.file.name}…`} />}

      {state.status === "error" && <ErrorMessage message={state.message} onRetry={reset} />}

      {state.status === "result" && (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-checkerboard p-4">
            {state.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL
              <img src={state.previewUrl} alt={`Preview of ${state.file.name}`} className="max-h-96 w-auto object-contain" />
            ) : (
              <p className="max-w-xs bg-card p-3 text-center text-sm text-muted-foreground">
                {state.info.tooLarge
                  ? "This image is too large to preview on this device."
                  : `No preview for ${state.info.formatLabel} yet. The details come from the file itself.`}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5">
            <FileDetails details={detailsFor(state.file, state.info)} />
            <Button variant="outline" className="self-start" onClick={reset}>
              Check another image
            </Button>
          </div>
          {state.info.exif && (
            <div className="md:col-span-2">
              <ExifSection exif={state.info.exif} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
