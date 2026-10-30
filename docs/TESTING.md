# Testing

PixelKit has **no automated tests** ([DECISIONS.md W-009](DECISIONS.md)). Each stage is validated by lint, a production build and a manual checklist run in real browsers.

## Commands

```bash
pnpm lint        # ESLint (Next.js rules + TypeScript)
pnpm build       # static export into out/; also type-checks
pnpm preview     # serves out/ on http://localhost:3000 with the production COOP/COEP headers
```

Use `pnpm preview`, not `pnpm dev`, for anything involving workers, WASM threads or AI: the dev server doesn't send the isolation headers.

## Browsers

| Browser | Platform | Required from |
|---|---|---|
| Chrome | Windows | every stage |
| Edge | Windows | every stage |
| Firefox | Windows | every stage |
| Safari | macOS | every stage (through the Vercel preview) |
| Safari | iPhone | every stage (through the Vercel preview) |
| Chrome | Android | W11 |

## Checklist (every stage)

- [ ] `pnpm lint` and `pnpm build` finish without errors.
- [ ] The file goes in by drag and drop and by click; name and size appear.
- [ ] The interface doesn't freeze during processing; progress is visible.
- [ ] The result downloads with the right name and extension.
- [ ] Warnings appear when they should (transparency filled, animation, no reduction, enlarged).
- [ ] An invalid or truncated file shows a clear message, not a broken page (`samples/corrupt.png`, `samples/random.bin`).
- [ ] An image too large for the device shows a warning instead of hanging (`samples/too-many-pixels.png`).
- [ ] The Network panel shows **no upload** of the user's file and no request to third parties (other than the AI model download).
- [ ] Works offline after the first visit (from W9).
- [ ] Keyboard only: every control reachable, focus visible; screen reader announces progress and errors.
- [ ] `self.crossOriginIsolated === true` in the console on the preview and deployed site.

## Stage checks

### W1

- [ ] Landing: header links (Tools scrolls to the grid, About opens, GitHub opens the repository in a new tab); only "Image info" is clickable in the grid.
- [ ] Image info:
  - [ ] `transparent.png` → PNG, 640 × 480, Transparency: Yes, preview over the checkerboard;
  - [ ] `photo.jpg` → JPEG, Transparency: No;
  - [ ] `fake-extension.png` → JPEG, with the "extension" note;
  - [ ] `too-many-pixels.png` → 11000 × 10000, "too large" note, no preview, no freeze;
  - [ ] `corrupt.png` → damaged-file error; `random.bin` → format-not-supported error.
- [ ] Footer "Source code" link on every page.

## Samples

[`samples/`](../samples/README.md) holds small generated files, including hostile ones. Real camera photos (12 MP JPEG, iPhone HEIC) are used locally and not committed.
