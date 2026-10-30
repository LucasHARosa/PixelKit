// Errors thrown inside workers carry a stable code in `name`, which Comlink keeps
// when it re-throws them on the main thread. The UI maps the code to a message.

export type ErrorCode =
  | "UNSUPPORTED_FORMAT"
  | "CORRUPT_FILE"
  | "IMAGE_TOO_LARGE"
  | "FILE_TOO_LARGE"
  | "INVALID_OPTION"
  | "UNSAFE_SVG"
  | "PDF_ENCRYPTED"
  | "TOO_MANY_FILES"
  | "MODEL_DOWNLOAD_FAILED"
  | "MODEL_LOAD_FAILED"
  | "CANCELLED"
  | "PROCESSING_FAILED";

export const errorMessages: Record<ErrorCode, string> = {
  UNSUPPORTED_FORMAT: "This file isn't a format PixelKit can read.",
  CORRUPT_FILE: "The file looks damaged or incomplete and couldn't be read.",
  IMAGE_TOO_LARGE: "This image is too large for this device to process in the browser.",
  FILE_TOO_LARGE: "This file is too large to process in the browser.",
  INVALID_OPTION: "These options can't be used together.",
  UNSAFE_SVG: "This SVG references outside files or scripts and was rejected.",
  PDF_ENCRYPTED: "This PDF is password-protected.",
  TOO_MANY_FILES: "Too many files at once.",
  MODEL_DOWNLOAD_FAILED: "The AI model couldn't be downloaded. Check your connection and try again.",
  MODEL_LOAD_FAILED: "The AI model couldn't start in this browser.",
  CANCELLED: "Cancelled.",
  PROCESSING_FAILED: "Something went wrong while processing the file.",
};

export class ToolError extends Error {
  constructor(code: ErrorCode, detail?: string) {
    super(detail ?? errorMessages[code]);
    this.name = code;
  }
}

/** Turns anything thrown (in a worker or not) into a code and a message for the UI. */
export function describeError(error: unknown): { code: ErrorCode; message: string } {
  if (error instanceof Error && error.name in errorMessages) {
    const code = error.name as ErrorCode;
    return { code, message: error.message || errorMessages[code] };
  }
  return { code: "PROCESSING_FAILED", message: errorMessages.PROCESSING_FAILED };
}
