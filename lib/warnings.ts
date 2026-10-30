// Non-fatal facts the UI tells the user about (same codes as the Python version).

export type WarningCode = "ALPHA_FLATTENED" | "ANIMATION_FIRST_FRAME_ONLY" | "NO_SIZE_REDUCTION" | "UPSCALED";

export const warningMessages: Record<WarningCode, { title: string; detail: string }> = {
  ALPHA_FLATTENED: {
    title: "Transparency filled",
    detail: "This format has no transparency, so transparent areas were filled with the background color.",
  },
  ANIMATION_FIRST_FRAME_ONLY: {
    title: "Only the first frame",
    detail: "The image is animated. Only its first frame was used.",
  },
  NO_SIZE_REDUCTION: {
    title: "No size reduction",
    detail: "The result isn't smaller than the original. The image may already be optimized.",
  },
  UPSCALED: {
    title: "Image enlarged",
    detail: "The image was smaller than the requested size and had to be enlarged, so it may look soft.",
  },
};
