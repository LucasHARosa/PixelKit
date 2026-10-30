# Design

Minimal, editorial and light. The composition of [lightspark.com](https://www.lightspark.com) is the reference for hierarchy, grid and use of white space; it is a guide, not something to copy.

## Tokens

Defined once in [`app/globals.css`](../app/globals.css) (`:root` + `@theme inline`) and used through Tailwind classes. Never hard-code a color in a component.

| Role | Token | Value | Tailwind |
|---|---|---|---|
| Page background | `--background` | `#FAFAF8` | `bg-background` |
| Surfaces (cards, panels) | `--card` | `#FFFFFF` | `bg-card` |
| Main text | `--foreground` | `#171717` | `text-foreground` |
| Secondary text | `--muted-foreground` | `#737373` | `text-muted-foreground` |
| Borders | `--border` | `#E7E7E3` | `border-border` |
| Highlight (brand lime) | `--highlight` | `#D8F36A` | `bg-highlight` |
| Primary buttons | `--primary` / `--primary-foreground` | `#171717` / `#FAFAF8` | `bg-primary` |
| Subtle surface (hover, chips) | `--secondary`, `--muted`, `--accent` | `#F2F2EE` | `bg-secondary` |
| Success | `--success` | `#247A45` | `text-success` |
| Error | `--destructive` | `#B42318` | `text-destructive` |
| Focus ring | `--ring` | `#171717` | — |

The lime is `--highlight`, not shadcn's `--accent`: shadcn uses `--accent` as the hover background of menus and ghost buttons, which must stay neutral.

### Contrast (WCAG AA)

| Pair | Ratio | Use |
|---|---|---|
| `#171717` on `#FAFAF8` | 17.15:1 | Body text |
| `#737373` on `#FAFAF8` | 4.54:1 | Secondary text — passes, with little margin |
| `#737373` on `#FFFFFF` | 4.74:1 | Secondary text on cards |
| `#737373` on `#F2F2EE` | 4.22:1 | ❌ Below AA: use `#171717` text on subtle surfaces |
| `#171717` on `#D8F36A` | 14.47:1 | Text on the highlight |
| `#D8F36A` on `#FAFAF8` | 1.19:1 | ❌ Never as text: the lime is only a background or a mark |
| `#247A45` on `#FFFFFF` | 5.32:1 | Success text |
| `#B42318` on `#FFFFFF` | 6.57:1 | Error text |

Ratios computed with the WCAG 2 relative-luminance formula.

## Typography

| Font | Token | Use |
|---|---|---|
| Geist Sans | `font-sans` | All interface text |
| Geist Mono | `font-mono` | Technical metadata: format, size, dimensions, times, GPU/CPU, section labels |
| Press Start 2P | `font-pixel` | Brand details only: the logo and very short labels. **Never** paragraphs or anything longer than a few words |

Fonts are loaded with `next/font/google`, which downloads them at build time and serves them from the site. Visitors never request Google Fonts.

Hierarchy: page titles `text-4xl`–`text-6xl font-semibold tracking-tight`; section titles `text-2xl`–`text-3xl`; body `text-base`; secondary `text-sm text-muted-foreground`; labels `font-mono text-xs uppercase tracking-wider`.

## Rules

- Light theme only.
- No gradients, no glassmorphism, no heavy shadows (`shadow-xs` at most).
  - The transparency checkerboard (`bg-checkerboard`) is a pattern, not a decoration, and is the one place a CSS gradient function is used.
- Thin (1px) borders; cards are white with a border, radius `rounded-2xl`.
- Lots of white space: sections separated by `gap-24`/`gap-32`, each opened by a thin rule and a numbered mono label (`01 — Tools`).
- Every interactive element has a visible focus outline (2px `--ring`).
- No button without a real action: planned tools are listed without a link; the install button appears only when the browser offers installation.
- Animation only in the three components below, and none when the user asks for reduced motion (`prefers-reduced-motion` also shortens all CSS transitions globally).

## Components

| Component | Source | Where | Adaptation |
|---|---|---|---|
| Cutout Card | `@cult-ui/cutout-card` (MIT) via `shadcn add` → [`components/ui/cutout-card.tsx`](../components/ui/cutout-card.tsx) | Tool cards on the landing | Multi-layer shadow replaced by a 1px border that darkens on hover; overlay gradient replaced by a flat tint; icon instead of a photo; corner "pin" shows Ready/Soon |
| Circuit Board | Inspired by `@cult-ui/circuit-board` (MIT) → [`components/ui/circuit-board.tsx`](../components/ui/circuit-board.tsx) | Long operations (AI background removal, large AVIF, large PDFs), next to a real progress bar | Rewritten: the original is a marketing block (CPU chip "Powered By", React/Turbopack/SWC cards, orange/blue/pink gradient pulses and glows). Kept: traces into a chip. Now: border-colored traces, ink dots moving along them, a dark chip with the operation name and a lime status pixel; static with reduced motion |
| Pixel Trail | `originkit add pixel-trail` | Only inside the hero visual box on the landing | Pending: the CLI needs the maintainer's Originkit login; the generated code and its terms are reviewed before use. Until then the box shows a static pixel field |
| shadcn/ui Button | `shadcn init` (radix, nova preset) | Everywhere | Added an `xl` size (h-11) for primary actions |

## Landing

1. Compact header: logo (pixel mark + "PixelKit" in Press Start 2P), links Tools, About, GitHub.
2. Hero: mono label, short title (the tagline), one-sentence description, "Browse tools" and "View source"; the decorative pixel box on the right.
3. `01 — Tools`: grid of Cutout Cards from `lib/tools.ts`.
4. `02 — Local processing`: the file's path (file → worker → WASM/WebGPU → download) and three principles.
5. `03 — Install`: use in the browser (install button when offered) and run your own copy.
6. Discreet footer: license, "No uploads · No tracking", About, Source code.

## Tool pages

Every tool uses [`ToolPage`](../components/tool/tool-page.tsx) (breadcrumb, icon, title, description) and the same flow:

| State | Shows |
|---|---|
| Empty | `Dropzone`: click, keyboard or drag and drop, accepted formats, "Nothing is uploaded" |
| Processing | `ProgressBar` (determinate when possible); `CircuitBoard` for long operations |
| Result | Preview (checkerboard behind transparent images), `FileDetails` in mono (format, size, dimensions), tool-specific numbers, `WarningList`, `DownloadButton` |
| Error | `ErrorMessage` (`role="alert"`) with a clear sentence and a way to start over |

Tool-specific: background removal shows the result over the checkerboard with `BeforeAfter`; compression shows original size, final size and % reduction; conversion shows source → target format.

Accessibility: the tool area is `aria-live="polite"`, errors use `role="alert"`, the progress bar has `role="progressbar"` with values, and everything works with the keyboard.
