import Link from "next/link";
import { getTool } from "@/lib/tools";

type ToolPageProps = {
  slug: string;
  children: React.ReactNode;
};

/** Shared layout of every tool: breadcrumb, title, description, then the tool itself. */
export function ToolPage({ slug, children }: ToolPageProps) {
  const tool = getTool(slug);
  const Icon = tool.icon;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10 pb-24 sm:px-6 sm:pt-16">
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
        <Link href="/#tools" className="hover:text-foreground">
          Tools
        </Link>
        <span className="px-2">/</span>
        <span aria-current="page">{tool.name}</span>
      </nav>
      <header className="mt-6 flex flex-col gap-3 border-b border-border pb-8">
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-card">
          <Icon className="size-5" aria-hidden />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
        <p className="max-w-2xl text-muted-foreground">{tool.description}</p>
      </header>
      <div className="mt-8">{children}</div>
    </main>
  );
}
