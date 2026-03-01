import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  /** visual size — default "md" */
  size?: "sm" | "md";
}

export function Input({
  label,
  error,
  hint,
  size = "md",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const sizeClass = size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--ui-text-muted)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[
          "w-full rounded-md border outline-none transition-colors",
          "bg-[var(--ui-input-bg)] text-[var(--ui-input-text)]",
          "placeholder:text-[var(--ui-input-placeholder)]",
          error
            ? "border-[var(--ui-danger-text)]"
            : "border-[var(--ui-input-border)] focus:border-[var(--ui-focus)]",
          "focus:ring-1 focus:ring-[var(--ui-focus)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClass,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && <p className="text-xs text-[var(--ui-danger-text)]">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-[var(--ui-text-subtle)]">{hint}</p>
      )}
    </div>
  );
}
