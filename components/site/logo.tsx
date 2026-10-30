import Link from "next/link";
import { cn } from "@/lib/utils";

/** 2×2 pixel mark: three ink pixels and one highlight pixel. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={cn("size-4", className)}>
      <rect x="0" y="0" width="7" height="7" className="fill-foreground" />
      <rect x="9" y="0" width="7" height="7" className="fill-highlight" />
      <rect x="0" y="9" width="7" height="7" className="fill-foreground" />
      <rect x="9" y="9" width="7" height="7" className="fill-foreground" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="PixelKit home">
      <LogoMark />
      <span className="font-pixel text-[11px] leading-none tracking-tight">PixelKit</span>
    </Link>
  );
}
