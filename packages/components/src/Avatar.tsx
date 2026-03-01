import { getAvatarColor, getAvatarInitial } from "./avatar-utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  url?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({
  name,
  email,
  url,
  size = "md",
  className = "",
}: AvatarProps) {
  const displayName = name || email;
  const color = getAvatarColor(displayName);
  const initial = getAvatarInitial(name, email);
  const sizeClass = sizeClasses[size];

  if (url) {
    return (
      <img
        src={url}
        alt={displayName ?? ""}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${sizeClass} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  );
}
