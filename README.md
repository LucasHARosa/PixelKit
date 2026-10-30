# PixelKit

**Free, open-source image and PDF tools that run entirely in your browser.**
*Your images. Your browser. Your tools.*

PixelKit compresses, converts and resizes images, builds favicons and app-store screenshots, removes backgrounds with AI and edits PDFs, without uploading anything. Every file is processed on your own device with WebAssembly and WebGPU. There are no accounts, no analytics and no server that could see your files.

> **Status: early development.** The feasibility spike (W0) and the foundation (W1) are in place; tools arrive stage by stage. See the [roadmap](docs/ROADMAP.md).

## Features

| Tool | What it does | Status |
|---|---|---|
| Image info | Real format (from the bytes, not the extension), dimensions, transparency, size | ✅ Available (EXIF in W2) |
| Compress | JPEG, PNG, WebP, AVIF with quality control; shows the size saved | Planned (W2) |
| Resize | Width/height with contain, cover or fill; no accidental upscaling | Planned (W2) |
| Convert | PNG, JPEG, WebP, AVIF, BMP, TIFF, GIF; reads HEIC and ICO | Planned (W2, HEIC in W5) |
| ICO & favicon | Multi-size ICO and a complete favicon package (ZIP) | Planned (W3) |
| Store screenshots | The 27 official App Store and Google Play sizes, without alpha | Planned (W3) |
| Remove background | AI on your GPU (WebGPU) or CPU; checkerboard preview | Planned (W4) |
| SVG → PNG | Any size, transparency kept, hostile SVGs rejected | Planned (W5) |
| Images ↔ PDF | Images to PDF with page size and margins; pages to PNG/JPEG | Planned (W6) |
| PNG → SVG | Real vector tracing, or embedding (clearly labeled) | Planned (W7) |
| QR code | Text, URL, Wi-Fi, e-mail, phone, vCard; PNG and SVG | Planned (W7) |
| Base64 | Text and files, with real type detection when decoding | Planned (W7) |
| PDF editor | Merge, reorder, rotate, sign, highlight, whiteout and **real redaction** | Planned (W8) |
| Batch | Many files with the same options, streamed into a ZIP | Planned (W10) |

## How it works

```
Your file ──▶ Web Worker ──▶ WebAssembly / WebGPU ──▶ Download
             (off the main thread)  (codecs, PDF engine, AI model)
```

- PixelKit is a **static website** (Next.js static export). The host only serves HTML, JavaScript and WebAssembly.
- Each tool sends your file to a **Web Worker**, which loads the library it needs **only when you use it**: jSquash codecs, MuPDF.js, or Transformers.js with ONNX Runtime.
- The result comes back as a file you download. Nothing leaves the tab.

More in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Privacy

- **No uploads.** Open the browser's Network panel while using a tool: your file never appears in a request.
- **No third parties.** Fonts and the ONNX Runtime are served by the site itself. No analytics, cookies or telemetry.
- **One exception, shown first:** AI tools download their model from Hugging Face the first time (44–115 MB), then use the cached copy, offline included.

## Browser support

| | Chrome / Edge 113+ | Firefox 141+ (Windows) | Safari 26 (macOS, iOS) |
|---|---|---|---|
| Image and PDF tools (WebAssembly) | ✅ | ✅ | ✅ |
| AI on the GPU (WebGPU) | ✅ | ✅ (145+ on Apple silicon) | ✅ |
| AI without WebGPU | CPU fallback (slower) | CPU fallback | CPU fallback |

Limits of the browser platform, such as memory per tab, canvas size on iPhone, AVIF encoding speed and 8-bit color, are listed in [docs/RESEARCH.md](docs/RESEARCH.md#browser-limitations). When a file is too large for the device, PixelKit says so instead of freezing.

## Tech stack

| Area | Choice | License |
|---|---|---|
| Framework | Next.js 16 (App Router, `output: 'export'`), React 19, TypeScript | MIT |
| UI | Tailwind CSS 4, shadcn/ui (Radix), Cult UI, Lucide, Motion | MIT / ISC |
| Workers | Comlink | Apache-2.0 |
| Image codecs | jSquash (MozJPEG, OxiPNG, libwebp, libavif), libheif-js | Apache-2.0 / LGPL-3.0 |
| PDF | MuPDF.js | AGPL-3.0 |
| AI | Transformers.js + ONNX Runtime Web; ISNet (AGPL-3.0) and BiRefNet lite (MIT) models | Apache-2.0 / MIT |
| Hosting | Vercel (static), with COOP/COEP headers | — |

Every dependency and why it was chosen: [docs/LICENSES.md](docs/LICENSES.md) and [docs/DECISIONS.md](docs/DECISIONS.md).

## Getting started

Requirements: Node.js 22+ and pnpm 10+.

```bash
git clone https://github.com/LucasHARosa/PixelKit.git
cd PixelKit
pnpm install        # also copies the ONNX Runtime WASM into public/ort
pnpm dev            # http://localhost:3000 (no cross-origin isolation)
```

To test like production, with multithreaded WASM:

```bash
pnpm build          # static site in out/
pnpm preview        # serves out/ with the COOP/COEP headers
```

`pnpm lint` runs ESLint. There are no automated tests; each stage is checked with the manual checklist in [docs/TESTING.md](docs/TESTING.md).

## Deploy

PixelKit is a plain static site, but it needs two response headers for multithreaded WebAssembly:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

On **Vercel** they come from [`vercel.json`](vercel.json): import the repository and deploy. On other hosts, set the same headers. GitHub Pages can't set headers and is not supported.

## Project structure

```
app/               routes: landing, /about, one folder per tool in (tools)/
components/
  ui/              shadcn/ui and Cult UI components
  site/            header, footer, logo
  landing/         landing page sections
  tool/            shared tool building blocks (Dropzone, ProgressBar, DownloadButton…)
  tools/           one component per tool
lib/
  workers/         Web Workers, worker registry, error codes
  codecs/          format sniffing, header parsing
  tools.ts         tool catalog (drives the landing grid)
scripts/           postinstall and preview helpers
samples/           test files, including hostile ones
docs/              vision, architecture, decisions, design, licenses, security, testing
```

## Contributing

Issues and pull requests are welcome.
- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [DESIGN.md](docs/DESIGN.md) first.
- A new tool is one route in `app/(tools)/`, one component in `components/tools/`, worker methods in `lib/workers/`, and an entry in `lib/tools.ts`.
- Heavy work always runs in a worker.
- New dependencies must be AGPL-compatible: no GPL-2.0-only, no non-commercial terms. Record the reason in `docs/DECISIONS.md`.
- Run the manual checklist in [TESTING.md](docs/TESTING.md) before opening a PR.

## License

Copyright (C) 2026 The PixelKit contributors.

PixelKit is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License** as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. See [LICENSE](LICENSE).

In short: use it, change it and share it freely. If you distribute a modified version **or run one as a website**, you must make its source code available under the same license.

## Credits

PixelKit is built on [MuPDF.js](https://mupdf.readthedocs.io/) (Artifex), [jSquash](https://github.com/jamsinclair/jSquash) and the Squoosh codecs, [Transformers.js](https://huggingface.co/docs/transformers.js) and [ONNX Runtime Web](https://onnxruntime.ai/), the [IS-Net](https://github.com/xuebinqin/DIS) and [BiRefNet](https://github.com/ZhengPeng7/BiRefNet) models (ONNX exports by onnx-community), [libheif](https://github.com/strukturag/libheif), [shadcn/ui](https://ui.shadcn.com/) and [Cult UI](https://www.cult-ui.com/). It started as a local Python/FastAPI app, whose research and measurements shaped this version.

## Documentation

[Vision](docs/VISION.md) · [Roadmap](docs/ROADMAP.md) · [Architecture](docs/ARCHITECTURE.md) · [Design](docs/DESIGN.md) · [Research](docs/RESEARCH.md) · [Decisions](docs/DECISIONS.md) · [Licenses](docs/LICENSES.md) · [Security](docs/SECURITY.md) · [Testing](docs/TESTING.md)
