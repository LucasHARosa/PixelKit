// Minimal BMP writer: 24-bit, bottom-up, no compression. BMP has no reliable
// alpha support across viewers, so callers flatten transparency first.

export function encodeBmp(image: ImageData): Uint8Array {
  const { width, height, data } = image;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const fileSize = 54 + pixelBytes;
  const out = new Uint8Array(fileSize);
  const view = new DataView(out.buffer);

  // BITMAPFILEHEADER
  out[0] = 0x42; // B
  out[1] = 0x4d; // M
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  // BITMAPINFOHEADER
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelBytes, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);

  for (let y = 0; y < height; y++) {
    const rowStart = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const o = rowStart + x * 3;
      out[o] = data[i + 2];
      out[o + 1] = data[i + 1];
      out[o + 2] = data[i];
    }
  }
  return out;
}
