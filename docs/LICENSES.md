# Licenses

Audit date: 2026-10-30. Sources: `package.json` of each installed package, the Hugging Face API for model repositories. **This is not legal advice.** `THIRD_PARTY_LICENSES.md` with the full texts is generated before release (W11).

## PixelKit: AGPL-3.0-or-later

The full text is in [`/LICENSE`](../LICENSE) (official text from gnu.org).

| Who | Can | Must |
|---|---|---|
| Anyone | use, study, modify and share it, also commercially | keep the license and copyright notices |
| Anyone distributing a modified copy | — | publish the modified source under AGPL-3.0 |
| **Anyone running a modified copy as a website** | — | offer the complete source to its users (AGPL §13). PixelKit does this with the "Source code" link in every page footer. |

Why AGPL: the project stays free and open even when hosted. Nobody can take it, improve it and run a closed paid version. It also allows AGPL dependencies (MuPDF.js, the ISNet weights).

## Compatibility rules

| License | Compatible with AGPL-3.0? |
|---|---|
| MIT, BSD, ISC, Zlib, Unlicense, OFL-1.1 (fonts) | ✅ |
| Apache-2.0 | ✅ |
| MPL-2.0 | ✅ |
| LGPL-2.1+/3.0 | ✅ |
| GPL-2.0-or-later, GPL-3.0, AGPL-3.0 | ✅ |
| **GPL-2.0-only** (e.g. `esm-potrace-wasm`) | ❌ |
| **Non-commercial** (e.g. BRIA RMBG weights, CC BY-NC) | ❌ |
| Unknown / not stated | ❌ until clarified |

Before adding a dependency, check its license and record the reason in [DECISIONS.md](DECISIONS.md).

## Runtime dependencies

| Package | Version | License | Shipped to the browser | Use |
|---|---|---|---|---|
| next | 16.4.3 | MIT | yes | Framework, static export |
| react, react-dom | 19.3.1 | MIT | yes | UI |
| radix-ui | 1.8.1 | MIT | yes | shadcn/ui primitives |
| @radix-ui/react-use-controllable-state | 1.3.0 | MIT | yes | Cutout Card |
| class-variance-authority | 0.7.1 | Apache-2.0 | yes | Component variants |
| cn | 0.5.1 | MIT | yes | Class merging (shadcn) |
| lucide-react | 1.65.0 | ISC | yes | Icons |
| motion | 14.9.0 | MIT | yes | Cutout Card animation |
| tw-animate-css | 1.4.0 | MIT | CSS only | shadcn animations |
| shadcn | 4.23.0 | MIT | CSS only (`shadcn/tailwind.css`) | Base styles |
| comlink | 4.4.2 | Apache-2.0 | yes | Worker RPC |
| @huggingface/transformers | 4.3.2 | Apache-2.0 | yes (AI tools) | Background removal pipeline |
| onnxruntime-web (via transformers) | 1.31.0-dev | MIT | yes (AI tools) | Inference on WebGPU/WASM |
| @jsquash/avif | 2.1.1 | Apache-2.0 | yes | AVIF encoder (libavif) |
| **mupdf** (MuPDF.js) | 1.28.1 | **AGPL-3.0-or-later** | yes (PDF tools) | PDF engine |
| libheif-js | 1.23.5 | **LGPL-3.0** | yes (HEIC) | HEIC/HEIF decoding |

`@huggingface/transformers` also installs `onnxruntime-node` and `sharp` for Node.js; neither is bundled for the browser (their install scripts are disabled in `pnpm-workspace.yaml`).

LGPL note: libheif-js is loaded as a separate module (its own chunk), so it stays replaceable as the LGPL requires.

## Copied components

| Component | Origin | License | Notes |
|---|---|---|---|
| `components/ui/button.tsx` | shadcn/ui | MIT | `xl` size added |
| `components/ui/cutout-card.tsx` | Cult UI (`@cult-ui/cutout-card`) | MIT | Shadow and overlay adapted to the design |
| `components/ui/circuit-board.tsx` | Rewritten from Cult UI `circuit-board` | MIT | Attribution in the file header |
| Pixel Trail | Originkit | ❓ Not stated for delivered components (the CLI itself is MIT) | Not adopted until its terms are reviewed |

## Fonts

| Font | License | Delivery |
|---|---|---|
| Geist Sans, Geist Mono | OFL-1.1 | `next/font/google`, self-hosted at build time |
| Press Start 2P | OFL-1.1 | `next/font/google`, self-hosted at build time |

## AI models

Downloaded by the visitor's browser from Hugging Face on first use; not part of the repository or the deployment.

| Model | License | Size | Status |
|---|---|---|---|
| `onnx-community/ISNet-ONNX` | **AGPL-3.0** (stated on the model card) | 88 MB fp16, 44 MB quantized | Default |
| `onnx-community/BiRefNet_lite-ONNX` | **MIT** (stated on the model card) | 114.5 MB fp16 | "Quality" option |
| BRIA RMBG 1.4 / 2.0 | Non-commercial | — | ❌ Excluded |

Attribution for both models is on the About page.

## Development dependencies

eslint (MIT), eslint-config-next (MIT), typescript (Apache-2.0), tailwindcss and @tailwindcss/turbopack (MIT), @types/* (MIT). Not shipped.

## Not used

| Package | License | Why |
|---|---|---|
| `@imgly/background-removal` | AGPL-3.0 | Pinned to onnxruntime-web 1.21 and Next.js 15 |
| `esm-potrace-wasm` | GPL-2.0-only | Incompatible license |
| `heic2any` | MIT | Unmaintained since 2023 |
| pdf.js + pdf-lib | Apache-2.0 / MIT | No real redaction; MuPDF.js covers everything |
