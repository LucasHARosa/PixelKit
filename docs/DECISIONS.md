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
Filled in after the measurements in [RESEARCH.md](RESEARCH.md#w0-measurements): for each W0 target, "go", "adjust" (e.g. smaller AI input, AVIF speed) or "no-go" with the alternative. Until then `/lab` stays in the repository (not linked from the site, `noindex`), so the measurements can still be taken on every browser; it is removed once the table is complete.

## W-012 — shadcn/ui with the Radix base and the `nova` preset · Accepted (2026-10-30)
`shadcn init` (CLI 4.23) with `-b radix -p nova` (Lucide icons, Geist). It installs `radix-ui`, `class-variance-authority`, `tw-animate-css`, `shadcn` (for `shadcn/tailwind.css`) and `cn`, the shadcn team's compiled replacement for `clsx` + `tailwind-merge` (MIT). The preset's colors are replaced by the design tokens and the dark theme is removed (light only).

## W-013 — The brand lime is `--highlight`, not `--accent` · Accepted (2026-10-30)
shadcn components use `--accent` as the hover background of menus and ghost buttons. Mapping the lime there would turn every hover green. `--accent` stays a neutral subtle surface and the lime gets its own token, used only as a background or mark with dark text (it fails contrast as text color).

## W-014 — Cult UI components adapted, Circuit Board rewritten · Accepted (2026-10-30)
- **Cutout Card** (`shadcn add @cult-ui/cutout-card`, MIT; pulls `motion` and `@radix-ui/react-use-controllable-state`) is used for the tool cards with two edits: a 1px border instead of the multi-layer shadow, and a flat tint instead of the overlay gradient.
- **Circuit Board** is not installed: the registry item is a fixed marketing block (a "Powered By" chip, React/Turbopack/SWC cards, gradient pulses and glows in orange, blue and pink). A small component in `components/ui/circuit-board.tsx` keeps only the idea (traces into a chip naming the operation) in the design's colors, with no gradients and no animation under reduced motion.

## W-015 — Pixel Trail from Originkit in the hero · Accepted (2026-10-30)
`originkit add pixel-trail` (run by the maintainer, signed in) wrote `components/originkit/ui/pixel-trail.tsx`. It has no dependencies and doesn't re-render while the pointer moves. The CLI is MIT, but the delivered code carries no license and originkit.dev has no terms page. The maintainer chose to use it anyway. To keep that choice cheap to undo:
- the file is kept unchanged in its own folder and configured only through props;
- it is used in exactly one place (the hero box);
- the static pixel field it replaces stays in the code as the reduced-motion fallback.

`.originkit/` (the CLI's local credentials and notes) is git-ignored.

## W-018 — Single-threaded AVIF encoder until the worker cycle is solved · Accepted (2026-10-30)
`next build` hung forever, with no error and no CPU use. Bisecting the code found the cause: `@jsquash/avif` loads its multithreaded build (`avif_enc_mt.js`) whenever threads are available. That file starts a pthread worker (`avif_enc_mt.worker.mjs`) which imports `avif_enc_mt.js` back, and Turbopack (Next 16.4.3) loops on that worker cycle. The spike now imports the single-threaded build (`codec/enc/avif_enc.js`) directly, so the cycle is never bundled.

Consequences:
- W0 measures single-threaded AVIF; its target (≤ 6 s for 12 MP) applies to that build.
- Before W2 ships AVIF output, decide whether that's enough. If not, serve the multithreaded encoder from `public/` outside the bundle (as with the ONNX Runtime, W-005) and load it at runtime.

## W-019 — Browser stub for Node's `module` · Accepted (2026-10-30)
`mupdf-wasm.js` runs `await import("module")` only when it detects Node.js, but the bundler still has to resolve it. `turbopack.resolveAlias` maps `module` to an empty file (`lib/node-stub.ts`) for browser builds. `tsconfig.json` also excludes `out/`: Turbopack copies each `*.worker.ts` there as a static asset (besides the real worker chunk), and the type checker would otherwise pick those copies up.

## W-020 — W2 image pipeline choices · Accepted (2026-10-30)
- **Decoding** uses the browser (`createImageBitmap` in the worker, which also applies EXIF orientation); TIFF uses `utif`. Encoding always uses WASM/JS encoders (W-007).
- **Resizing** uses `@jsquash/resize` (Squoosh's Lanczos 3, Catmull-Rom, triangle) instead of `pica`: same family as the other codecs, one WASM module, no worker pool of its own. Nearest neighbor is a few lines of JS.
- **Lossy PNG:** `image-q` creates one object per pixel, which needs more than 1 GB for a 12 MP photo. It now only builds the palette (Wu quantizer, ≤ 262 144-pixel sample); Floyd–Steinberg dithering onto that palette runs on typed arrays in `lib/image/quantize.ts`.
- **OxiPNG** is imported from its single-threaded build (`codec/pkg`): the parallel build starts wasm-bindgen-rayon workers, the same kind of worker cycle as W-018.
- **Keep metadata** uses `piexifjs` and is limited to JPEG → JPEG, as planned (RESEARCH, limitation 5).

## W-016 — Own format sniffing and header parsing · Accepted (2026-10-30)
Detecting the real format needs only the magic bytes of eleven formats, and refusing decompression bombs needs width and height from PNG, JPEG, GIF, BMP and WebP headers. Both are ~150 lines in `lib/codecs/` with no dependency, and run before any decode. `file-type` stays an option if more formats (archives, video) are ever needed.

## W-017 — First tool in W1: Image info · Accepted (2026-10-30)
The plan called for an example route to prove the worker plumbing. A real tool proves the same thing without a throwaway page: Image info goes through Dropzone → worker → sniffing → header limits → decode → result. W2 adds EXIF, GPS and animation frames to it.
