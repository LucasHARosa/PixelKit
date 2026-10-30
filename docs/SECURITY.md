# Security and privacy

PixelKit is a static website that processes files inside the visitor's browser. There is no server-side code and no user data on any server.

## Threat model

| Threat | Mitigation |
|---|---|
| A user's file leaking to a third party | Nothing is uploaded. All processing runs in the tab. The only network requests are the site's own files and the AI model download. Fonts and the ONNX Runtime are self-hosted, so there are no third-party CDNs. No analytics, cookies or telemetry. |
| A hostile file crashing or freezing the page | Real format sniffed from bytes; size read from the header and huge images refused before decoding; all decoding in workers, which can be terminated; decoder failures become `CORRUPT_FILE` instead of a broken page. |
| Decompression bombs (tiny file, huge pixel count) | `MAX_IMAGE_PIXELS` checked against header dimensions before decoding (`samples/too-many-pixels.png` is 110 MP in 29 KB). |
| A hostile SVG reading local files or running scripts | SVG → PNG (W5) sanitizes before rendering: no DOCTYPE/entities, no external `href` (only `data:` and `#id`), no `<script>`, no event attributes, no CSS `url()`/`@import` to outside resources. Rendering goes through an `<img>`, where browsers don't run scripts or fetch external resources. |
| Hostile PDFs | MuPDF.js renders and edits only; PDF JavaScript is never run and attachments are not extracted. Encrypted PDFs give `PDF_ENCRYPTED`. |
| Supply chain | Versions pinned in `pnpm-lock.yaml`; install scripts of unused native packages are disabled; models come only from a fixed catalog of Hugging Face repositories. |
| A tampered or substituted model | Models are loaded only from the fixed repository IDs in the code, over HTTPS. |

## PDF redaction vs whiteout

The PDF editor (W8) offers two tools and labels them clearly:

- **Whiteout** only covers content. The original text stays in the file and can still be copied or found by search.
- **Redaction** removes the text, images and drawings under the area from the file (MuPDF `applyRedactions`). Only redaction is safe for sensitive data. W0 verifies this by searching the saved file for the redacted text.

## Headers

Set by the host ([`vercel.json`](../vercel.json)):

| Header | Value | Why |
|---|---|---|
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross-origin isolation (needed for `SharedArrayBuffer`) |
| `Cross-Origin-Embedder-Policy` | `credentialless` | Same, while still allowing model downloads from Hugging Face |
| `X-Content-Type-Options` | `nosniff` | Files are served with their declared type only |
| `Referrer-Policy` | `no-referrer` | Outgoing links (GitHub, Hugging Face) don't learn which page or tool was used |

A Content Security Policy is planned for W9, once every runtime source (workers, WASM, model hosts) is known.

## File names

Download names come from the user's file name, cleaned by `safeFilename()`: no folders, no control or reserved characters, no Windows reserved names (`CON`, `COM1`…), at most 80 characters.

## Reporting a vulnerability

Open a private security advisory on the GitHub repository.
