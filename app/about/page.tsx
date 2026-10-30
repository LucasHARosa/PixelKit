import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "What PixelKit is, how it keeps your files private, and its license.",
};

const credits = [
  { name: "MuPDF.js", by: "Artifex", license: "AGPL-3.0", use: "PDF rendering, editing and redaction" },
  { name: "jSquash", by: "Jamie Sinclair and the Squoosh authors", license: "Apache-2.0", use: "JPEG, PNG, WebP and AVIF codecs" },
  { name: "Transformers.js", by: "Hugging Face", license: "Apache-2.0", use: "Running the AI model in the browser" },
  { name: "ONNX Runtime Web", by: "Microsoft", license: "MIT", use: "WebGPU and WebAssembly inference" },
  { name: "IS-Net (DIS)", by: "Xuebin Qin et al., ONNX by onnx-community", license: "AGPL-3.0", use: "Background removal model" },
  { name: "BiRefNet", by: "Peng Zheng et al., ONNX by onnx-community", license: "MIT", use: "High-quality background removal model" },
  { name: "libheif", by: "struktur AG, packaged by libheif-js", license: "LGPL-3.0", use: "HEIC/HEIF decoding" },
  { name: "Cult UI", by: "Nolly Studio", license: "MIT", use: "Cutout card and circuit board components" },
  { name: "shadcn/ui, Radix, Lucide", by: "their authors", license: "MIT / ISC", use: "Interface components and icons" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header className="flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">About</p>
        <h1 className="text-4xl font-semibold tracking-tight">Image tools that don&apos;t need your files</h1>
        <p className="text-lg text-muted-foreground">
          PixelKit is a free collection of image and PDF tools that runs entirely in your browser. It began as a local
          Python app and was rebuilt as a static website, so it needs no installation and no server.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="text-muted-foreground">
          Your files are processed inside the browser tab with WebAssembly and WebGPU and are never uploaded. The site
          has no analytics, no third-party cookies and no telemetry. The only downloads besides the site itself are
          the AI models, fetched from Hugging Face the first time you use an AI tool, with their size shown first.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">License and source code</h2>
        <p className="text-muted-foreground">
          PixelKit is free software under the GNU Affero General Public License, version 3 or later. You can use,
          study, change and share it. If you run a modified version as a website, you must offer its source code to
          your users too.
        </p>
        <p>
          <a href={site.repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Source code on GitHub
          </a>
          {" · "}
          <a href={site.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            License text
          </a>
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Built with</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border font-mono text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-normal">Project</th>
                <th scope="col" className="px-4 py-3 font-normal">Used for</th>
                <th scope="col" className="px-4 py-3 font-normal">License</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((credit) => (
                <tr key={credit.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{credit.name}</span>
                    <span className="block text-xs text-muted-foreground">{credit.by}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{credit.use}</td>
                  <td className="px-4 py-3 font-mono text-xs">{credit.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
