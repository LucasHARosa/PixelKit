import { TriangleAlert } from "lucide-react";
import { warningMessages, type WarningCode } from "@/lib/warnings";

export function WarningList({ warnings }: { warnings: WarningCode[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2" aria-label="Warnings">
      {warnings.map((code) => (
        <li key={code} className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">{warningMessages[code].title}</p>
            <p className="text-muted-foreground">{warningMessages[code].detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
