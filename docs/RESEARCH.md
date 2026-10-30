# Research

Research date: **2026-10-27**. Versions come from the npm registry and the Hugging Face API on that date.

Every statement is tagged:

- ✅ **Confirmed** — measured or executed for this project.
- 📄 **Documented** — stated by official docs, package metadata or source code, not executed.
- ❓ **Pending** — to be measured; listed in [Pending](#pending).

## Reference machine

| | |
|---|---|
| OS | Windows 11 Pro |
| CPU | AMD Ryzen 7 5700G (8 cores / 16 threads) |
| RAM | 48 GB |
| GPU | AMD Radeon RX 6650 XT (8 GB) |
| Tooling | Node 22.18, pnpm 10.34 |

## Where this comes from

The previous PixelKit (Python/FastAPI, frozen) implemented and measured compression, conversion, resize, ICO/favicon, store screenshots and AI background removal. Its findings that still apply are reused here:

- ✅ The IS-Net model takes **~300 ms** per 12 MP photo on the RX 6650 XT through native DirectML, and ~1.2 s on the CPU. The browser will be slower; W0 measures how much.
- ✅ MuPDF (through PyMuPDF, same engine as MuPDF.js) removes text from the file with redaction, while a white rectangle only covers it. Embedded fonts handle full Unicode, and font subsetting took a test PDF from 1.6 MB to 9 KB.
- 📄 Store screenshot sizes come from the official Apple and Google Play pages (checked 2026-10-24); see [TOOLS.md](TOOLS.md) from W2 on.

### lacorte.dev (analysed 2026-10-24)

📄 From its public bundles: Next.js App Router on Vercel, tools run in the browser with no API. Background removal uses `@imgly/background-removal` 1.7.0 (AGPL) with onnxruntime-web on WASM/CPU and the IS-Net fp16 model (88 MB). The PDF editor uses pdf.js to render and pdf-lib to write; "edit text" draws a white box and new text over the old one, which stays in the file.

## Verified facts (2026-10-27)

| Fact | Tag |
|---|---|
| `onnx-community/ISNet-ONNX` is **AGPL-3.0**; files `model.onnx` (176 MB), `model_fp16` (88 MB), `model_int8`, `model_uint8`, `model_quantized` (44 MB). Same weights as IMG.LY's. | 📄 HF API |
| `onnx-community/BiRefNet_lite-ONNX` is **MIT**; `model.onnx` and `model_fp16.onnx` (114.5 MB). | 📄 HF API |
| Hugging Face and IMG.LY's CDN send `Access-Control-Allow-Origin`; GitHub release downloads don't, so models hosted there need a mirror. | 📄 |
| `@imgly/background-removal` 1.7.0 is pinned to onnxruntime-web 1.21.0 and supports only Next.js 15 → not used. | 📄 |
| `@huggingface/transformers` 4.3.2 depends on `onnxruntime-web` **1.31.0-dev.20260914**, not the stable 1.31.1. | ✅ lockfile |
| Transformers.js loads the ONNX Runtime WASM from `cdn.jsdelivr.net` unless `env.backends.onnx.wasm.wasmPaths` is set. | ✅ source |
| WebGPU is on by default in Chrome/Edge 113+, Firefox 141+ (Windows) and 145+ (macOS ARM), Safari 26 (macOS, iOS). | 📄 |
| Canvas `toBlob('image/webp')` works in Chrome and Firefox, not in Safari. AVIF through canvas is unreliable. → WASM encoders. | 📄 |
| `mupdf` (MuPDF.js) 1.28.1 is AGPL-3.0 and exposes `toPixmap`, `graftPage`, `rearrangePages`, `deletePage`, `insertPage`, `addFont`, `addImage`, `createAnnotation("Redact")` + `applyRedactions`. | ✅ type definitions |
| Next.js 16.4.3 scaffolds with `cacheComponents: true`, which needs the Node.js runtime → disabled for the static export. | ✅ bundled docs |

### WASM payloads (file sizes in `node_modules`)

| Library | File | Size | Compressed |
|---|---|---|---|
| ONNX Runtime (default build, WebGPU + WASM) | `ort-wasm-simd-threaded.asyncify.wasm` | 26.9 MB | ❓ measure transfer |
| ONNX Runtime (plain, Safari < 26 without WebGPU) | `ort-wasm-simd-threaded.wasm` | 14.3 MB | ❓ |
| MuPDF.js | `mupdf-wasm.wasm` | 9.9 MB | 3.5 MB (brotli file shipped in the package) |
| jSquash AVIF encoder | `avif_enc.wasm` / `avif_enc_mt.wasm` | 3.3 / 3.4 MB | ❓ |
| libheif-js | `libheif-bundle.mjs` (WASM inlined as base64) | 1.9 MB | ❓ |

✅ file sizes. Transfer sizes are reported by `/lab` from Resource Timing.

## W0 measurements

How to measure: `pnpm build && pnpm preview`, open `http://localhost:3000/lab`, click **Run all**, then **Copy results as Markdown** and paste the table here. For Safari and iPhone, use the Vercel preview deployment. The default input is a synthetic 4000×3000 image; a real photo can be chosen on the page.

| Measurement | Target | Chrome (Win, RX 6650 XT) | Edge (Win) | Firefox (Win) | Safari (macOS) | Safari (iPhone) |
|---|---|---|---|---|---|---|
| `crossOriginIsolated` | true | ❓ | ❓ | ❓ | ❓ | ❓ |
| ISNet fp16, WebGPU, 12 MP (pre + model + cutout) | ≤ 1.5 s | ❓ | ❓ | ❓ | ❓ | ❓ |
| ISNet uint8, WASM, 12 MP | ≤ 8 s | ❓ | ❓ | ❓ | ❓ | ❓ |
| BiRefNet lite fp16, WebGPU, 12 MP (extra) | — | ❓ | ❓ | ❓ | ❓ | ❓ |
| AVIF 12 MP, speed 6 (single-threaded, W-018) | ≤ 6 s | ❓ | ❓ | ❓ | ❓ | ❓ |
| AVIF 12 MP, speed 8 (single-threaded) | ≤ 6 s | ❓ | ❓ | ❓ | ❓ | ❓ |
| Largest 2D canvas | record | ❓ | ❓ | ❓ | ❓ | ❓ |
| MuPDF.js render + redaction (text gone after save) | works | ❓ | ❓ | ❓ | ❓ | ❓ |
| HEIC 12 MP with libheif-js | ≤ 3 s | ❓ | — | — | — | — |

Raw output from each browser goes below this table.

## Browser limitations

| # | Limitation | What PixelKit does |
|---|---|---|
| 1 | **Huge images**: memory per tab (WASM32 up to 4 GB) and canvas size limits; low on iPhone/iPad (❓ ~16.7 MP, measured in W0) | Check size and device before processing; warn "image too large for this device"; use tiles when possible |
| 2 | **AI speed**: WebGPU is slower than native GPU; WASM on the CPU takes seconds; first use downloads 44–115 MB | Show download and processing progress; offer the smaller model |
| 3 | **AVIF** encoding of 12 MP in WASM takes seconds | Progress indicator; adjustable speed |
| 4 | **Color and precision**: canvas is 8-bit and may drop ICC profiles; 16-bit PNG becomes 8-bit | Documented; WASM decoders where precision matters |
| 5 | **Keeping metadata** works only for JPEG (`piexifjs`) | "Keep metadata" appears only for JPEG |
| 6 | **Edge refinement** (alpha matting) has no maintained JS equivalent | BiRefNet lite as "quality" mode |
| 7 | **No CLI/API**; large batches are tied to the open tab | Out of scope |
| 8 | **Browser differences** (Safari: no WebP from canvas; native HEIC only in Safari) | Always WASM encoders; feature detection at runtime |
| 9 | **Cross-origin isolation** (COOP/COEP) is needed for multithreaded WASM; a static export can't set headers | Set by the host (`vercel.json`) |
| 10 | **Editing existing PDF text** is not possible in general | Whiteout + new text, and redaction to really remove |

## Pending

1. All cells of the W0 table above.
2. Real iPhone HEIC photos (HDR, 10-bit, multi-image).
3. Transfer (compressed) sizes of every WASM file.
