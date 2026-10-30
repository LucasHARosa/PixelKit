import { cn } from "@/lib/utils";

export type Detail = { label: string; value: React.ReactNode };

/** Technical metadata (format, size, dimensions…) in a mono key/value list. */
export function FileDetails({ details, className }: { details: Detail[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm", className)}>
      {details.map((detail) => (
        <div key={detail.label} className="contents">
          <dt className="text-muted-foreground">{detail.label}</dt>
          <dd className="min-w-0 break-words">{detail.value}</dd>
        </div>
      ))}
    </dl>
  );
}
