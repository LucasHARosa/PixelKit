export type Row = Record<string, string | number | boolean | null | undefined>;

export type LabResult = {
  /** Main number shown in the table, e.g. "812 ms". */
  value: string;
  /** Whether the W0 target was met; null when there is no target. */
  pass: boolean | null;
  details: Row;
  preview?: Blob;
};

export type Progress = (message: string) => void;

export type AiDevice = "webgpu" | "wasm";
export type AiDtype = "fp32" | "fp16" | "q8" | "uint8" | "int8";

export type AiOptions = {
  model: string;
  device: AiDevice;
  dtype: AiDtype;
  file?: Blob;
};
