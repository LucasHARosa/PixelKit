"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

// Native form controls styled with the design tokens. Native elements keep
// keyboard, screen reader and mobile behavior for free.

const controlClass =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors focus-visible:border-foreground disabled:opacity-50";

type FieldProps = { label: string; hint?: string; className?: string };

function FieldShell({ id, label, hint, className, children }: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  className,
  value,
  options,
  onChange,
}: FieldProps & { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className={controlClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function RangeField({
  label,
  hint,
  className,
  value,
  min,
  max,
  onChange,
}: FieldProps & { value: number; min: number; max: number; onChange: (value: number) => void }) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-mono text-sm">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-foreground"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Positive integer input; empty means "not set" (null). */
export function NumberField({
  label,
  hint,
  className,
  value,
  min = 1,
  max = 50_000,
  placeholder,
  onChange,
}: FieldProps & {
  value: number | null;
  min?: number;
  max?: number;
  placeholder?: string;
  onChange: (value: number | null) => void;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : null);
        }}
        className={cn(controlClass, "font-mono")}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  className,
  checked,
  disabled,
  onChange,
}: FieldProps & { checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <div className={cn("flex gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-foreground"
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className={cn("text-sm font-medium", disabled && "opacity-50")}>
          {label}
        </label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function ColorField({
  label,
  hint,
  className,
  value,
  onChange,
}: FieldProps & { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-input bg-card p-1"
        />
        <span className="font-mono text-sm">{value.toUpperCase()}</span>
      </div>
    </FieldShell>
  );
}

/** Small set of mutually exclusive choices shown as buttons (radio group). */
export function SegmentedField<T extends string>({
  label,
  hint,
  className,
  value,
  options,
  onChange,
}: FieldProps & { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const name = useId();
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)}>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-lg border border-input bg-card p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
              value === option.value ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  );
}
