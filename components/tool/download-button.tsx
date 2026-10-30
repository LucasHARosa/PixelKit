"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";

type DownloadButtonProps = {
  blob: Blob;
  filename: string;
  label?: string;
};

/** Saves a result produced in the page. The object URL exists only for the click. */
export function DownloadButton({ blob, filename, label = "Download" }: DownloadButtonProps) {
  function save() {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    // Give the browser time to start the download before releasing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  return (
    <Button size="xl" onClick={save}>
      <Download data-icon="inline-start" aria-hidden />
      {label}
      <span className="font-mono text-primary-foreground/70">{formatBytes(blob.size)}</span>
    </Button>
  );
}
