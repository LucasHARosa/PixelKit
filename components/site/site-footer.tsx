import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-3" />
          <span>
            © {new Date().getFullYear()} PixelKit contributors ·{" "}
            <a href={site.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {site.license}
            </a>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-mono text-xs">No uploads · No tracking</span>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          {/* AGPL §13: every page links to the complete source code. */}
          <a href={site.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Source code
          </a>
        </div>
      </div>
    </footer>
  );
}
