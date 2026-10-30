"use client";

import { useEffect, useState } from "react";

/** An object URL for a blob, revoked when the blob changes or the component unmounts. */
export function useObjectUrl(blob: Blob | null): string | null {
  const [entry, setEntry] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    // Syncing with an external resource (the browser's blob URL registry).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntry({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  // Never hand out a URL that belongs to a previous blob.
  return entry && entry.blob === blob ? entry.url : null;
}
