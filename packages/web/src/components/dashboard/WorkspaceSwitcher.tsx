import { Dropdown, DropdownDivider, DropdownItem } from "@acme/components";
import type { Workspace } from "@acme/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Lang } from "../../lib/types";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentSlug?: string;
  lang: Lang;
  onCreateNew: () => void;
}

export default function WorkspaceSwitcher({
  workspaces,
  currentSlug,
  lang,
  onCreateNew,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const current = workspaces.find((ws) => ws.slug === currentSlug);

  const trigger = (
    <button
      type="button"
      className="cursor-pointer w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-sidebar-item-hover)] transition-colors"
    >
      <WsIcon name={current?.name ?? "?"} size="md" />
      <span className="flex-1 text-left truncate">
        {current
          ? current.name
          : lang === "zh"
            ? "选择空间站"
            : "Select workspace"}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-[var(--ui-text-muted)] shrink-0" />
    </button>
  );

  return (
    <Dropdown open={open} onOpenChange={setOpen} trigger={trigger} align="left">
      {workspaces.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
            {lang === "zh" ? "空间站" : "Workspaces"}
          </div>
          {workspaces.map((ws) => (
            <DropdownItem
              key={ws.id}
              onClick={() => {
                setOpen(false);
                navigate(`/dashboard/${ws.slug}`);
              }}
            >
              <span className="flex items-center gap-2.5">
                <WsIcon name={ws.name} size="sm" />
                <span className="truncate">{ws.name}</span>
                {ws.slug === currentSlug && (
                  <span className="ml-auto text-xs text-[var(--ui-text-muted)]">
                    ✓
                  </span>
                )}
              </span>
            </DropdownItem>
          ))}
          <DropdownDivider />
        </>
      )}
      <DropdownItem
        onClick={() => {
          setOpen(false);
          onCreateNew();
        }}
      >
        <span className="flex items-center gap-2.5">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)]">
            +
          </span>
          <span>{lang === "zh" ? "新建空间站" : "New workspace"}</span>
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

function WsIcon({ name, size }: { name: string; size: "sm" | "md" }) {
  const letter = name.charAt(0).toUpperCase();
  const dim = size === "md" ? "h-6 w-6" : "h-5 w-5";
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-md bg-[var(--ui-bg-element)] text-xs font-bold uppercase text-[var(--ui-text-muted)] border border-[var(--ui-border)]`}
    >
      {letter}
    </span>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
