// Pure size calculations for resizing (port of geometry.py from the Python version).
// Reference cases (source 400×200) are listed in docs/TOOLS.md.

export type Fit = "contain" | "cover" | "fill";

export type Size = { width: number; height: number };

/** Resize to `size`, then optionally center-crop to `crop`. */
export type Geometry = { size: Size; crop: Size | null };

export type GeometryRequest = {
  width?: number | null;
  height?: number | null;
  fit?: Fit;
  allowUpscale?: boolean;
};

function scaled(source: Size, scale: number): Size {
  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  };
}

/**
 * - Only one side given: the other follows the aspect ratio.
 * - contain: fit inside the box, keeping the ratio.
 * - cover: fill the box keeping the ratio, then crop the overflow (centered).
 * - fill: stretch to exactly the box.
 * Without `allowUpscale` the image is never enlarged.
 */
export function computeGeometry(source: Size, request: GeometryRequest): Geometry {
  const { width, height, fit = "contain", allowUpscale = false } = request;
  const cap = (scale: number) => (allowUpscale ? scale : Math.min(scale, 1));

  if (!width) {
    if (!height) throw new Error("width or height is required");
    return { size: scaled(source, cap(height / source.height)), crop: null };
  }
  if (!height) {
    return { size: scaled(source, cap(width / source.width)), crop: null };
  }

  if (fit === "fill") {
    const size = allowUpscale
      ? { width, height }
      : { width: Math.min(width, source.width), height: Math.min(height, source.height) };
    return { size, crop: null };
  }

  if (fit === "contain") {
    return { size: scaled(source, cap(Math.min(width / source.width, height / source.height))), crop: null };
  }

  const size = scaled(source, cap(Math.max(width / source.width, height / source.height)));
  const crop = { width: Math.min(width, size.width), height: Math.min(height, size.height) };
  const cropped = crop.width !== size.width || crop.height !== size.height;
  return { size, crop: cropped ? crop : null };
}

/** Final output size after the optional crop. */
export function outputSize(geometry: Geometry): Size {
  return geometry.crop ?? geometry.size;
}

/** True when any side of the result is larger than the source. */
export function isUpscaled(source: Size, geometry: Geometry): boolean {
  return geometry.size.width > source.width || geometry.size.height > source.height;
}
