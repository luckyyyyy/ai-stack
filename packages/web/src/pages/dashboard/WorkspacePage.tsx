import type { User } from "@acme/types";
import { useWorkspace } from "../../components/dashboard/WorkspaceContext";

interface WorkspacePageProps {
  user: User | null;
}

export default function WorkspacePage({ user }: WorkspacePageProps) {
  const workspace = useWorkspace();

  return (
    <div className="p-8">
      <div className="rounded-lg border bg-[var(--ui-bg)] border-[var(--ui-border)] p-8 text-center space-y-3">
        <h2 className="text-2xl font-semibold text-[var(--ui-text)]">
          空间站占位符
        </h2>
        <p className="text-[var(--ui-text-muted)]">
          当前工作空间：
          <code className="text-[var(--ui-focus)]">{workspace.name}</code>
          <span className="ml-2 text-xs text-[var(--ui-text-subtle)]">
            /{workspace.slug}
          </span>
        </p>
        {user && (
          <p className="text-sm text-[var(--ui-text-subtle)]">
            用户：{user.name || user.email}
          </p>
        )}
      </div>
    </div>
  );
}
