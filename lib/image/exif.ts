// Reading EXIF for the info tool, and carrying JPEG EXIF over to a JPEG output
// when the user asks to keep metadata.

export type ExifSummary = {
  orientation: number | null;
  camera: string | null;
  lens: string | null;
  takenAt: string | null;
  exposure: string | null;
  software: string | null;
  gps: { latitude: number; longitude: number } | null;
  /** Every readable tag, for the full metadata table. */
  tags: Record<string, string>;
};

function formatValue(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array || ArrayBuffer.isView(value)) return null; // binary blobs (thumbnails, maker notes)
  if (Array.isArray(value)) return value.length > 12 ? null : value.map(String).join(", ");
  if (typeof value === "object") return null;
  const text = String(value);
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}

export async function readExif(file: Blob): Promise<ExifSummary | null> {
  const { default: exifr } = await import("exifr");
  let data: Record<string, unknown> | undefined;
  try {
    data = await exifr.parse(file, { tiff: true, exif: true, gps: true, xmp: false, icc: false, iptc: false });
  } catch {
    return null;
  }
  if (!data) return null;

  const tags: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const text = formatValue(value);
    if (text) tags[key] = text;
  }
  const make = typeof data.Make === "string" ? data.Make.trim() : "";
  const model = typeof data.Model === "string" ? data.Model.trim() : "";
  const camera = [make, model.startsWith(make) ? model.slice(make.length).trim() : model].filter(Boolean).join(" ");
  const exposureParts = [
    typeof data.FNumber === "number" ? `f/${data.FNumber}` : null,
    typeof data.ExposureTime === "number"
      ? data.ExposureTime < 1
        ? `1/${Math.round(1 / data.ExposureTime)} s`
        : `${data.ExposureTime} s`
      : null,
    typeof data.ISO === "number" ? `ISO ${data.ISO}` : null,
    typeof data.FocalLength === "number" ? `${data.FocalLength} mm` : null,
  ].filter(Boolean);

  const latitude = typeof data.latitude === "number" ? data.latitude : null;
  const longitude = typeof data.longitude === "number" ? data.longitude : null;
  const taken = data.DateTimeOriginal ?? data.CreateDate;

  return {
    orientation: typeof data.Orientation === "number" ? data.Orientation : null,
    camera: camera || null,
    lens: typeof data.LensModel === "string" ? data.LensModel : null,
    takenAt: taken instanceof Date ? taken.toISOString().replace("T", " ").slice(0, 19) : formatValue(taken),
    exposure: exposureParts.length ? exposureParts.join(" · ") : null,
    software: typeof data.Software === "string" ? data.Software : null,
    gps: latitude != null && longitude != null ? { latitude, longitude } : null,
    tags,
  };
}

function toBinaryString(bytes: Uint8Array): string {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return out;
}

function fromBinaryString(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i);
  return out;
}

/**
 * Copies the EXIF block of a source JPEG into an output JPEG. Orientation is
 * reset to 1 because the pixels were already rotated upright when decoded.
 * Returns the output unchanged if the source has no readable EXIF.
 */
export async function copyJpegExif(sourceJpeg: Uint8Array, outputJpeg: Uint8Array): Promise<Uint8Array> {
  const { default: piexif } = await import("piexifjs");
  try {
    const exif = piexif.load(toBinaryString(sourceJpeg));
    if (exif["0th"]) exif["0th"][piexif.ImageIFD.Orientation] = 1;
    delete exif.thumbnail;
    if (exif["1st"]) exif["1st"] = {};
    const block = piexif.dump(exif);
    return fromBinaryString(piexif.insert(block, toBinaryString(outputJpeg)));
  } catch {
    return outputJpeg;
  }
}
