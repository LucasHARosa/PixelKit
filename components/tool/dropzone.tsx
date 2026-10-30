"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  onFiles: (files: File[]) => void;
  /** Same syntax as the `accept` attribute of a file input. */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Short hint under the main label, e.g. "PNG, JPEG, WebP, AVIF". */
  hint?: string;
  className?: string;
};

/** Click, keyboard or drag-and-drop file picker. Files never leave the page. */
export function Dropzone({ onFiles, accept, multiple = false, disabled = false, hint, className }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [dragging, setDragging] = useState(false);

  function deliver(list: FileList | null) {
    if (!list || list.length === 0 || disabled) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    deliver(event.dataTransfer.files);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-foreground/25 bg-card px-6 py-14 text-center transition-colors",
          "hover:border-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
          dragging && "border-foreground bg-highlight/30",
          className,
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background">
          <Upload className="size-5" aria-hidden />
        </span>
        <span className="text-base font-medium">
          {dragging ? "Drop to open" : multiple ? "Drop files here or choose them" : "Drop a file here or choose one"}
        </span>
        {hint && (
          <span id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </span>
        )}
        <span className="text-xs text-muted-foreground">Processed on your device. Nothing is uploaded.</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          deliver(event.target.files);
          event.target.value = "";
        }}
      />
    </>
  );
}
