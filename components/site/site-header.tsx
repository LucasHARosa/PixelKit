import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { Logo } from "./logo";

const linkClass = "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link href="/#tools" className={linkClass}>
            Tools
          </Link>
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <a href={site.repoUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-1`}>
            GitHub
            <ArrowUpRight className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
