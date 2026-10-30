type SectionHeadingProps = {
  index: string;
  label: string;
  title: string;
  description?: string;
};

/** Editorial section header: a numbered mono label above a short title. */
export function SectionHeading({ index, label, title, description }: SectionHeadingProps) {
  return (
    <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {index} — {label}
      </p>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description && <p className="max-w-xl text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
