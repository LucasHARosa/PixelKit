// Resizing with the Squoosh resize codecs (WASM), plus nearest neighbor in JS.

import { resizeNearest } from "./pixels";

export type ResampleMethod = "lanczos" | "bicubic" | "bilinear" | "nearest";

const SQUOOSH_METHOD = {
  lanczos: "lanczos3",
  bicubic: "catrom",
  bilinear: "triangle",
} as const;

export async function resizeImage(image: ImageData, width: number, height: number, method: ResampleMethod): Promise<ImageData> {
  if (width === image.width && height === image.height) return image;
  if (method === "nearest") return resizeNearest(image, width, height);
  const { default: resize } = await import("@jsquash/resize");
  return resize(image, {
    width,
    height,
    method: SQUOOSH_METHOD[method],
    fitMethod: "stretch",
    premultiply: true,
    linearRGB: true,
  });
}
