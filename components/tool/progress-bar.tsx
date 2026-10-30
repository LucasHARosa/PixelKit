import { cn } from "@/lib/utils";

type ProgressBarProps = {
  /** 0–1. Null shows an indeterminate bar. */
  value: number | null;
  label: string;
  className?: string;
};

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = value == null ? null : Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span>{label}</span>
        {percent != null && <span className="font-mono text-muted-foreground">{percent}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        className="relative h-1.5 overflow-hidden rounded-full bg-secondary"
      >
        {percent != null ? (
          <div className="h-full rounded-full bg-foreground transition-[width] duration-300" style={{ width: `${percent}%` }} />
        ) : (
          <div className="absolute inset-y-0 w-1/3 animate-[progress-slide_1.4s_ease-in-out_infinite] rounded-full bg-foreground" />
        )}
      </div>
    </div>
  );
}
