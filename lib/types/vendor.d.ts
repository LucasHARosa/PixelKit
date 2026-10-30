// Minimal typings for untyped dependencies: only the parts PixelKit calls.

declare module "utif" {
  type Ifd = { width: number; height: number; [tag: string]: unknown };
  const UTIF: {
    decode(buffer: ArrayBuffer | Uint8Array): Ifd[];
    decodeImage(buffer: ArrayBuffer | Uint8Array, ifd: Ifd, ifds?: Ifd[]): void;
    toRGBA8(ifd: Ifd): Uint8Array;
    encodeImage(rgba: Uint8Array | Uint8ClampedArray, width: number, height: number, metadata?: Record<string, unknown>): ArrayBuffer;
  };
  export default UTIF;
}

declare module "gifenc" {
  export type Palette = number[][];
  export type QuantizeFormat = "rgb565" | "rgb444" | "rgba4444";
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: { format?: QuantizeFormat; oneBitAlpha?: boolean | number; clearAlpha?: boolean; clearAlphaThreshold?: number },
  ): Palette;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Palette, format?: QuantizeFormat): Uint8Array;
  export function GIFEncoder(options?: { auto?: boolean }): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: { palette?: Palette; transparent?: boolean; transparentIndex?: number; delay?: number; repeat?: number },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  };
}

declare module "piexifjs" {
  type IfdData = Record<number, unknown>;
  type ExifObject = { "0th"?: IfdData; Exif?: IfdData; GPS?: IfdData; "1st"?: IfdData; thumbnail?: string | null };
  const piexif: {
    load(jpegBinary: string): ExifObject;
    dump(exif: ExifObject): string;
    insert(exifBinary: string, jpegBinary: string): string;
    remove(jpegBinary: string): string;
    ImageIFD: Record<string, number>;
  };
  export default piexif;
}
