import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  CutoutCard,
  CutoutCardContent,
  CutoutCardMedia,
  CutoutCardPin,
  CutoutCorner,
  cutoutCardSurfaceClassName,
} from "@/components/ui/cutout-card";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

/** A tool in the landing grid. Planned tools are shown without a link. */
export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <CutoutCard className={cn(cutoutCardSurfaceClassName, "flex flex-col")}>
      <CutoutCardMedia className="flex h-32 items-center justify-center bg-secondary">
        <Icon
          className={cn(
            "size-8 transition-transform duration-500 group-hover/cutout:scale-110",
            !tool.available && "text-foreground/40",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        <CutoutCardPin className="top-0 right-0 rounded-bl-xl bg-card px-3 py-1.5">
          {/* Corner pieces in the card color make the pin look cut out of the media area. */}
          <CutoutCorner className="absolute top-0 -left-4 -rotate-90 text-card" size={16} />
          <CutoutCorner className="absolute top-full right-0 -rotate-90 text-card" size={16} />
          <span className="font-mono text-[11px] text-muted-foreground">{tool.available ? "Ready" : "Soon"}</span>
        </CutoutCardPin>
      </CutoutCardMedia>
      <CutoutCardContent className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="flex items-center justify-between gap-2 font-medium">
          {tool.available ? (
            // Stretched link: the whole card is clickable, the accessible name is the tool name.
            <Link href={`/${tool.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {tool.name}
            </Link>
          ) : (
            <span>{tool.name}</span>
          )}
          {tool.available && <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
        </h3>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </CutoutCardContent>
    </CutoutCard>
  );
}
