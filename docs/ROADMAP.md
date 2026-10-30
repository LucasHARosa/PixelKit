# Roadmap

Each stage ends with `pnpm lint` and `pnpm build` clean, the stage's manual checklist done in the target browsers, and a set of commits. Status: ✅ done · 🔄 in progress · ⏳ planned.

| # | Stage | Main deliverables | Exit criteria | Status |
|---|---|---|---|---|
| W0 | Feasibility spike | Next.js 16 static export, `vercel.json` headers, `/lab` page measuring AI (WebGPU/WASM), AVIF, canvas limit, MuPDF.js redaction, HEIC | Numbers recorded in RESEARCH.md; go/no-go in DECISIONS.md | 🔄 page built, measurements pending |
| W1 | Foundation | shadcn/ui with the design tokens, app shell, landing, About, tool catalog, Comlink worker infrastructure, shared tool components (Dropzone, OptionsPanel, BeforeAfter, DownloadButton, ProgressBar, WarningList, CircuitBoard), first tool (Image info) | Static build; preview deploy opens; `crossOriginIsolated` true; dropping a file shows its name and size | 🔄 built, checklist pending |
| W2 | Image core | Image info, compress, resize, convert; geometry rules; jSquash, pica, image-q, utif, gifenc, BMP writer | Every matrix format converts and reopens; alpha kept or filled with a warning; EXIF rotation applied; truncated/random files give a clear error; UI never freezes | ⏳ |
| W3 | Icons and stores | ICO, favicon package, store screenshots (27 presets), streaming ZIP | ICO opens in Windows with all sizes; package has 8 files; every screenshot exact size without alpha; ZIP folders per preset, duplicate names renamed | ⏳ |
| W4 | Background removal | Transformers.js + ISNet (WebGPU/WASM), model manager, BiRefNet lite option, background color, PNG/WebP/JPEG | Works offline after the first download; shows WebGPU or CPU and the time; clearing the cache works; falls back to WASM with a notice | ⏳ |
| W5 | HEIC and SVG | libheif-js on demand (native decoder in Safari); SVG → PNG with sanitizing | A real iPhone photo converts; an SVG with `<image href="file:///…">` leaks nothing; invalid SVG gives an error | ⏳ |
| W6 | PDF ↔ images | MuPDF.js worker: images → PDF, PDF → PNG/JPEG (DPI, pages, ZIP) | Round trip keeps the aspect ratio; encrypted and corrupt PDFs give clear errors | ⏳ |
| W7 | Utilities | PNG → SVG (embed and trace), QR code, Base64 | Embed and trace clearly distinct; QR read by a phone; Base64 round-trips binary and UTF-8 | ⏳ |
| W8 | PDF editor | Thumbnails with drag reorder, merge, rotate, delete, text, image, signature, highlight, whiteout, redaction, undo/redo, export | Redacted text can't be selected or found in the exported PDF; whiteout says "covers, doesn't erase"; a 100-page PDF stays fluid | ⏳ |
| W9 | Landing, SEO, PWA | Final landing, per-tool metadata and Open Graph, sitemap, robots, offline PWA, About and Source pages | Installed and offline, non-AI tools work; AI tools work when the model is cached | ⏳ |
| W10 | Batch | Many images with the same options, per-file progress and errors, cancel, streaming ZIP | 50 photos of 12 MP processed one at a time without running out of memory | ⏳ |
| W11 | Release | Full manual checklist in every browser, production deploy, THIRD_PARTY_LICENSES.md, final README | Checklist passes in Chrome, Edge, Firefox, Safari macOS, Safari iPhone, Chrome Android | ⏳ |

Order rationale:
- W0 comes first because it decides whether the riskiest parts (AI speed, WASM in workers under Turbopack, PDF redaction, iPhone memory) work in the browser at all.
- The image core (W2) builds the worker, codec and warning plumbing that every later tool reuses.
- AI comes right after the image tools (W4), because it's the highest-value feature and the heaviest dependency.
- The PDF editor (W8) is the largest UI piece and builds on the PDF worker from W6.
