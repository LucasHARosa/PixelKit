# Vision

**PixelKit** — free, open-source image and PDF tools.
*"Your images. Your browser. Your tools."*

PixelKit is a collection of everyday image and PDF tools — compress, convert, resize, favicons, store screenshots, background removal, PDF editing, QR codes and more — that runs **entirely in the user's browser**. There is no backend: files are processed on the user's device with JavaScript, WebAssembly and WebGPU, and never leave it.

PixelKit started as a local Python/FastAPI app. That version validated the tools, the libraries and the AI model, and is kept as a frozen reference. This project rebuilds the same toolkit as a static website, so it needs no installation and no server.

## Who it is for

- People who convert, compress or clean up images regularly and don't want to upload them to third-party sites.
- Developers and designers who need favicons, WebP/AVIF exports, store screenshots or quick background removal.
- Anyone handling sensitive PDFs who needs to merge, sign or truly redact them without sending them anywhere.

## Principles

1. **Private by construction** — no uploads. All processing happens on the device. The only network requests are the site's own files and, on first use of an AI tool, the model download (shown with its size before it starts).
2. **Free and open** — licensed AGPL-3.0-or-later. The source is public, and the site links to it (AGPL §13).
3. **Static** — free static hosting, no server, no per-use cost.
4. **Offline after the first visit** — the app and the AI models are cached (PWA).
5. **Fast to open** — each heavy library (WASM, models) loads only when the tool that needs it is opened.
6. **Honest** — when the browser can't handle something (an image too large for the device, a format it can't read), the UI says so instead of failing silently. Labels say what a feature really does ("embed" is not "vectorize"; "whiteout" covers, "redaction" removes).
7. **No tracking** — no analytics, no third-party cookies, no telemetry.

## Scope

| In scope | Out of scope (for now) |
|---|---|
| Image info and EXIF viewer | Image editing (layers, drawing, filters) |
| Compress, resize, convert (PNG, JPEG, WebP, AVIF, BMP, TIFF, GIF; read HEIC/HEIF and ICO) | HEIC/HEIF output |
| ICO and favicon package, App Store / Google Play screenshots | Animated GIF/WebP output (first frame only) |
| AI background removal (WebGPU, CPU fallback) | Cloud processing, accounts |
| SVG → PNG, PNG → SVG (embed and trace) | Full vector editing |
| Images → PDF, PDF → images, PDF editor with real redaction | Editing existing PDF text in place, OCR |
| QR codes, Base64 | CLI or API for other programs |
| Batch processing with ZIP export | |

## Non-goals

- PixelKit does not promise smaller files in every case: already-optimized images may not shrink, and the UI says so.
- PixelKit does not try to match native desktop apps on huge files. Browser memory and canvas limits apply; see [RESEARCH.md](RESEARCH.md#browser-limitations).
