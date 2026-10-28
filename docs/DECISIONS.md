# Decisions

Lightweight ADR log. Status: **Accepted**, **Proposed** (waiting for data or confirmation), **Superseded**.

`D-xxx` numbers refer to the decision log of the previous, Python-based PixelKit (frozen reference repository). This log starts again at `W-001`.

## W-001 — Browser-only rewrite; the FastAPI version is frozen · Accepted (2026-10-27)
lacorte.dev showed that every PixelKit tool can run in the browser with good results. A static site needs no install, no server and no per-use cost, and makes the privacy promise structural: there is nowhere to upload to. The Python repository stays as a reference for research, measurements, presets and algorithms. Supersedes D-001 (FastAPI backend), D-002 (Vite SPA), D-021 (AI server-side) and D-024 (utilities through the backend).

## W-002 — Next.js 16 App Router with a static export · Accepted (2026-10-27)
`output: 'export'` produces one HTML file per route, which gives each tool its own indexable page, and Server Components still render at build time. No API routes, Server Actions, middleware or default image optimization (`images.unoptimized`). The Next 16.4.3 template enables `cacheComponents` and `partialPrefetching`; both are removed because Cache Components needs the Node.js runtime, and its `<Activity>` navigation would keep heavy tool pages alive in memory.

## W-003 — License AGPL-3.0-or-later · Accepted (2026-10-27)
Carries D-026 over. The project stays free and open, including when hosted: the site links to its source (AGPL §13). AGPL dependencies (MuPDF.js, ISNet-ONNX weights) are allowed. GPL-2.0-only and non-commercial terms (e.g. BRIA RMBG weights) are excluded.

## W-004 — Vercel hosting with COOP/COEP headers · Accepted (2026-10-27)
Multithreaded WASM needs `SharedArrayBuffer`, which needs cross-origin isolation. A static export can't set headers, so `vercel.json` sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`. `credentialless` (not `require-corp`) lets the page fetch models from Hugging Face, which doesn't send CORP headers. GitHub Pages can't set headers, so it's not an option. `pnpm preview` serves `out/` locally with the same headers.

## W-005 — The site serves the ONNX Runtime WASM itself · Accepted (2026-10-27)
By default Transformers.js fetches `ort-wasm-simd-threaded.*` from `cdn.jsdelivr.net`. That is a third-party request outside the privacy rule ("only the site's own files and the model download"). `scripts/copy-ort-wasm.mjs` runs on `postinstall`, copies the asyncify build (WebGPU + WASM) and the plain build (Safari < 26 without WebGPU) into `public/ort/` (git-ignored), and the AI worker points `env.backends.onnx.wasm.wasmPaths` at them. Cost: ~41 MB added to the deployment; each visitor downloads only the build their browser uses, and only when they open an AI tool.

## W-006 — Transformers.js with ISNet-ONNX by default, BiRefNet lite for quality · Proposed (pending W0 numbers)
`pipeline('background-removal', 'onnx-community/ISNet-ONNX', { device: 'webgpu', dtype: 'fp16' })`, falling back to `device: 'wasm'` with a quantized model (44 MB). ISNet is the same family as the previous default (D-011) and the weights now have an explicit AGPL-3.0 license. `onnx-community/BiRefNet_lite-ONNX` (MIT, 114.5 MB) is the "quality" option for hair and fine edges. The manual pre/post-processing from D-013 is kept as the fallback recipe if the pipeline doesn't fit. `@imgly/background-removal` is not used (pinned to ORT 1.21 and Next 15).

## W-007 — WASM encoders instead of canvas `toBlob` · Accepted (2026-10-27)
Safari can't encode WebP from a canvas and AVIF through canvas is unreliable. jSquash (MozJPEG, OxiPNG, libwebp, libavif) gives the same output in every browser. Lossy PNG keeps the palette approach from D-018 (`image-q`).

## W-008 — MuPDF.js for every PDF operation · Accepted (2026-10-27)
Carries D-027 over to the browser: one dependency renders pages, builds PDFs from images, merges, reorders, rotates, deletes, adds text with embedded fonts, images and annotations, and does **real redaction**. pdf.js + pdf-lib (lacorte.dev's choice) can't redact, so they're not used. Cost: ~10 MB WASM (3.5 MB brotli), loaded only by PDF tools.

## W-009 — No automated tests · Accepted (2026-10-27)
Validation is `pnpm lint`, `pnpm build` and the manual checklist in `TESTING.md`, run in every target browser at the end of each stage. Replaces the pytest/Vitest strategy of the previous project.

## W-010 — One Web Worker per library family, created lazily, with Comlink · Accepted (2026-10-27)
Heavy work never runs on the main thread. Each family (image codecs, AI, PDF, vector) has its own module worker, created on first use and importing its library with a dynamic `import()`, so the landing page loads no WASM and a crash in one library doesn't take down the others. Workers are created with `new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' })`, the form Turbopack recognizes.

## W-011 — W0 go/no-go · Proposed
Filled in after the measurements in [RESEARCH.md](RESEARCH.md#w0-measurements): for each W0 target, "go", "adjust" (e.g. smaller AI input, AVIF speed) or "no-go" with the alternative.
