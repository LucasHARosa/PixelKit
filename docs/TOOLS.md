# Tools

What each tool does, its options and defaults, and the warnings it can show. Behavior matches the Python version of PixelKit unless noted.

## Common rules

- **Real format:** detected from the first bytes ([`lib/codecs/sniff.ts`](../lib/codecs/sniff.ts)), never from the extension.
- **Size limit:** images above 100 MP (`MAX_IMAGE_PIXELS`) are refused before decoding when the header gives the size (PNG, JPEG, GIF, BMP, WebP, TIFF).
- **EXIF orientation** is applied: photos come out upright.
- **Metadata** (EXIF, GPS, camera) is removed by default. "Keep metadata" copies the EXIF block when both the input and the output are JPEG; the orientation tag is reset to 1 because the pixels are already upright.
- **Animated GIF / APNG / WebP:** only the first frame is used.
- **Download name:** the original name without its extension, cleaned, plus the new extension ([`lib/filename.ts`](../lib/filename.ts)).

### Warnings

| Code | Shown as | When |
|---|---|---|
| `ALPHA_FLATTENED` | Transparency filled | Transparent pixels written to a format without alpha (JPEG, BMP) |
| `ANIMATION_FIRST_FRAME_ONLY` | Only the first frame | The input has more than one frame |
| `NO_SIZE_REDUCTION` | No size reduction | Compress produced a file that isn't smaller |
| `UPSCALED` | Image enlarged | Resize made the image larger than the original |

### Errors

| Code | Message (summary) |
|---|---|
| `UNSUPPORTED_FORMAT` | Not a format PixelKit can read (also HEIC and SVG in these tools, until W5) |
| `CORRUPT_FILE` | Damaged or incomplete file |
| `IMAGE_TOO_LARGE` | More pixels than the device can process |
| `INVALID_OPTION` | Options that can't be combined (e.g. no width and no height) |

## Formats

| | Read | Write | Library |
|---|---|---|---|
| PNG | ✅ | ✅ (+ lossy palette, OxiPNG) | browser decoder; `@jsquash/png`, `@jsquash/oxipng`, `image-q` |
| JPEG | ✅ | ✅ | browser decoder; `@jsquash/jpeg` (MozJPEG) |
| WebP | ✅ | ✅ (lossy and lossless) | browser decoder; `@jsquash/webp` |
| AVIF | ✅ | ✅ (single-threaded, W-018) | browser decoder; `@jsquash/avif` |
| GIF | ✅ (first frame) | ✅ (256 colors, 1-bit alpha) | browser decoder; `gifenc` |
| BMP | ✅ | ✅ (24-bit, no alpha) | browser decoder; own writer |
| TIFF | ✅ (first page) | ✅ (uncompressed RGBA) | `utif` |
| ICO | ✅ (browser picks one size) | W3 | browser decoder |
| HEIC/HEIF | W5 | ❌ | — |
| SVG | W5 | — | — |

Every write goes through WASM or JS encoders, never `canvas.toBlob`, so the result is the same in every browser (W-007).

## Image info

Format, MIME type, file size, dimensions, megapixels, transparency (any pixel not fully opaque), number of frames, EXIF orientation, and a note when the extension doesn't match the real format. EXIF section: camera, lens, date, exposure, software, all readable tags, and a highlighted notice when the photo contains a **GPS location**, with an OpenStreetMap link (opened only if clicked).

## Compress

| Option | Default | Notes |
|---|---|---|
| Output format | Same as original | JPEG, PNG, WebP, AVIF. BMP/TIFF/GIF input needs an explicit format |
| Quality | 80 | 1–100 |
| Lossless | off | PNG: skip the palette, only optimize. WebP/AVIF: lossless. Disabled for JPEG |
| Max width / height | — | Fits inside (contain), never enlarges, Lanczos |
| Keep metadata | off | JPEG → JPEG |

**PNG is lossy by default:** reduced to a palette of `round(256 × quality / 100)` colors (2–256), keeping transparency, then optimized with OxiPNG. The palette is built by `image-q` (Wu quantizer) from a downscaled sample; Floyd–Steinberg dithering is applied on the full image ([`lib/image/quantize.ts`](../lib/image/quantize.ts)).

The result shows original size, final size and the % saved; `NO_SIZE_REDUCTION` when it didn't shrink.

## Resize

| Option | Default | Notes |
|---|---|---|
| Width, height | 1200, — | 1–50 000. One side → the other follows the ratio |
| Fit | contain | Only with both sides: contain, cover (center crop), fill (stretch) |
| Allow enlarging | off | Off: never larger than the source |
| Resampling | Lanczos | Lanczos 3, bicubic (Catmull-Rom), bilinear (triangle) via `@jsquash/resize`; nearest in JS |
| Output format | Same as original | PNG, JPEG, WebP, AVIF |
| Quality | 90 | JPEG, WebP, AVIF |
| Background | white | Fills transparency for JPEG/BMP |

### Geometry

Rules in [`lib/image/geometry.ts`](../lib/image/geometry.ts). Reference cases with a 400×200 source (all verified):

| Request | Result |
|---|---|
| width 100 | 100×50 |
| height 50 | 100×50 |
| width 800 | 400×200 (no enlarging) |
| width 800, allow enlarging | 800×400 |
| contain 100×100 | 100×50 |
| cover 100×100 | 200×100 → crop 100×100 |
| cover 300×300 | 400×200 → crop 300×200 |
| fill 100×100 | 100×100 |
| fill 900×100 | 400×100 (no enlarging) |

## Convert

| Option | Default | Notes |
|---|---|---|
| Convert to | WebP | PNG, JPEG, WebP, AVIF, BMP, TIFF, GIF |
| Quality | 90 | JPEG, WebP, AVIF |
| Lossless | off | WebP, AVIF |
| Background | white | Shown for JPEG and BMP (no transparency) |
| Keep metadata | off | JPEG → JPEG |

The result shows source → target format, sizes and dimensions.
