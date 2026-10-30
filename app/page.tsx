import Link from "next/link";
import { ArrowUpRight, Cpu, Scale, ShieldCheck } from "lucide-react";
import { HeroVisual } from "@/components/landing/hero-visual";
import { InstallButton } from "@/components/landing/install-button";
import { SectionHeading } from "@/components/landing/section-heading";
import { ToolCard } from "@/components/landing/tool-card";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

const principles = [
  {
    icon: ShieldCheck,
    title: "Nothing is uploaded",
    text: "Files are read and written inside this tab. There is no server to send them to.",
  },
  {
    icon: Cpu,
    title: "Your device does the work",
    text: "WebAssembly runs the codecs and PDF engine; WebGPU runs the AI model on your graphics card when the browser supports it.",
  },
  {
    icon: Scale,
    title: "Open source",
    text: `Licensed ${site.license}. Anyone can read the code and check these claims.`,
  },
];

const pipeline = ["Your file", "Web Worker", "WebAssembly / WebGPU", "Download"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pt-14 pb-28 sm:px-6 sm:pt-20 sm:gap-32">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span className="size-2 bg-highlight" aria-hidden />
            Image & PDF tools · 100% in your browser
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{site.tagline}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Compress, convert, resize, remove backgrounds and edit PDFs without uploading anything. Free and open
            source.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link href="#tools">Browse tools</Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <a href={site.repoUrl} target="_blank" rel="noopener noreferrer">
                View source
                <ArrowUpRight data-icon="inline-end" aria-hidden />
              </a>
            </Button>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section id="tools" className="flex scroll-mt-8 flex-col gap-10">
        <SectionHeading
          index="01"
          label="Tools"
          title="Everyday image and PDF work"
          description="Pick a tool, drop a file, download the result. New tools appear here as they're finished."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-10">
        <SectionHeading
          index="02"
          label="Local processing"
          title="Your files stay on your device"
          description="PixelKit is a static website. Opening it downloads the tools; your files are never sent anywhere."
        />
        <ol className="flex flex-wrap items-center gap-2 font-mono text-xs" aria-label="How a file is processed">
          {pipeline.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border bg-card px-2.5 py-1.5">{step}</span>
              {i < pipeline.length - 1 && <span aria-hidden className="text-muted-foreground">→</span>}
            </li>
          ))}
        </ol>
        <div className="grid gap-8 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3 border-t border-border pt-5">
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <SectionHeading
          index="03"
          label="Install"
          title="Nothing to install, unless you want to"
          description="PixelKit works in any modern browser. You can also run your own copy."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-medium">Use it in the browser</h3>
            <p className="text-sm text-muted-foreground">
              Open a tool and start. When your browser offers to install PixelKit as an app, the button appears here.
            </p>
            <div>
              <InstallButton />
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <h3 className="font-medium">Run it yourself</h3>
            <p className="text-sm text-muted-foreground">Needs Node.js 22 and pnpm.</p>
            <pre className="overflow-x-auto rounded-lg bg-primary p-4 font-mono text-xs leading-relaxed text-primary-foreground">
              <code>{`git clone ${site.repoUrl}.git\ncd PixelKit\npnpm install\npnpm dev`}</code>
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
