import { cn } from "@/lib/utils";

type OptionsPanelProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

/** Groups a tool's settings. A fieldset so screen readers announce the group. */
export function OptionsPanel({ title = "Options", children, className }: OptionsPanelProps) {
  return (
    <fieldset className={cn("flex flex-col gap-5 rounded-2xl border border-border bg-card p-5", className)}>
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </fieldset>
  );
}
