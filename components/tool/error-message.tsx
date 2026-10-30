import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorMessageProps = {
  message: string;
  /** Shown as a button when the user can do something about it. */
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorMessage({ message, onRetry, retryLabel = "Choose another file" }: ErrorMessageProps) {
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-3 text-sm">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <p className="text-destructive">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
