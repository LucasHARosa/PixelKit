/// <reference lib="webworker" />
import * as Comlink from "comlink";
import type { LabResult, Progress } from "./types";
import { wasmTransfer } from "./sample";

const SECRET = "SECRET-4242";
const PUBLIC = "Public text stays";

const api = {
  async redaction(progress: Progress): Promise<LabResult> {
    progress("Loading MuPDF.js…");
    const t0 = performance.now();
    const mupdf = await import("mupdf");
    const loadMs = performance.now() - t0;

    // Build a one-page PDF with a public line and a secret line, then reopen it
    // from bytes as if the user had dropped it.
    const source = new mupdf.PDFDocument();
    const font = source.addSimpleFont(new mupdf.Font("Helvetica"));
    const resources = source.addObject({ Font: { F1: font } });
    const contents = `BT /F1 24 Tf 72 720 Td (${PUBLIC}) Tj ET BT /F1 24 Tf 72 680 Td (${SECRET}) Tj ET`;
    source.insertPage(0, source.addPage([0, 0, 595, 842], 0, resources, contents));
    const original = source.saveToBuffer("compress").asUint8Array().slice();

    const doc = mupdf.Document.openDocument(original, "application/pdf") as InstanceType<typeof mupdf.PDFDocument>;
    const page = doc.loadPage(0);

    progress("Rendering at 150 DPI…");
    let t = performance.now();
    const pixmap = page.toPixmap(mupdf.Matrix.scale(150 / 72, 150 / 72), mupdf.ColorSpace.DeviceRGB, false, true);
    const png = pixmap.asPNG();
    const renderMs = performance.now() - t;

    const textBefore = page.toStructuredText("preserve-whitespace").asText();

    progress("Applying redaction…");
    t = performance.now();
    const hits = page.search(SECRET, undefined);
    if (!hits.length) throw new Error("Secret text not found before redaction");
    for (const quads of hits) {
      const xs = quads.flatMap((q) => [q[0], q[2], q[4], q[6]]);
      const ys = quads.flatMap((q) => [q[1], q[3], q[5], q[7]]);
      const annot = page.createAnnotation("Redact");
      annot.setRect([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
    }
    page.applyRedactions(true);
    const redacted = doc.saveToBuffer("garbage,compress").asUint8Array().slice();
    const redactMs = performance.now() - t;

    // Reopen the saved file: the secret must be gone, the public line must remain.
    const check = mupdf.Document.openDocument(redacted, "application/pdf");
    const textAfter = check.loadPage(0).toStructuredText("preserve-whitespace").asText();
    const secretGone = !textAfter.includes(SECRET);
    const publicKept = textAfter.includes(PUBLIC);
    const rawBytesClean = !new TextDecoder("latin1").decode(redacted).includes(SECRET);

    const wasm = wasmTransfer(/mupdf-wasm/);

    return {
      value: secretGone && publicKept ? "redaction works" : "redaction FAILED",
      pass: secretGone && publicKept,
      preview: new Blob([png.slice()], { type: "image/png" }),
      details: {
        "load MuPDF (ms)": Math.round(loadMs),
        "render A4 150 DPI (ms)": Math.round(renderMs),
        "render size": `${pixmap.getWidth()}×${pixmap.getHeight()}`,
        "redact + save (ms)": Math.round(redactMs),
        "secret found before": textBefore.includes(SECRET),
        "secret extractable after": !secretGone,
        "public text kept": publicKept,
        "secret absent from raw bytes": rawBytesClean,
        "PDF size before/after (bytes)": `${original.length} / ${redacted.length}`,
        "mupdf-wasm (KB transferred / decoded)": wasm.map((f) => `${f.transferKB} / ${f.decodedKB}`).join(", ") || "from cache",
      },
    };
  },
};

export type PdfWorkerApi = typeof api;
Comlink.expose(api);
