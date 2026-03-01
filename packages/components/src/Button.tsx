import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

// All colors via CSS vars — no inline styles, so hover/focus states override correctly.
const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--ui-btn-primary-bg)] hover:bg-[var(--ui-btn-primary-bg-hover)] text-[var(--ui-btn-primary-text)] border-transparent",
  secondary:
    "bg-[var(--ui-btn-secondary-bg)] hover:bg-[var(--ui-btn-secondary-bg-hover)] text-[var(--ui-btn-secondary-text)] border-[var(--ui-btn-secondary-border)]",
  ghost:
    "bg-[var(--ui-btn-ghost-bg)] hover:bg-[var(--ui-btn-ghost-bg-hover)] text-[var(--ui-btn-ghost-text)] border-transparent",
  danger:
    "bg-[var(--ui-btn-danger-bg)] hover:bg-[var(--ui-btn-danger-bg-hover)] text-[var(--ui-btn-danger-text)] border-transparent",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-8 px-4 text-sm",
  lg: "h-9 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-1.5",
        "font-medium rounded-md border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--ui-focus)] focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <>
          <Spinner />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="animate-spin h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
