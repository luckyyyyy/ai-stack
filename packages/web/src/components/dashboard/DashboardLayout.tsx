import type { User } from "@acme/types";
import { useState } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import type { Lang, LangMode, Theme, ThemeMode } from "../../lib/types";
import { UserMenu } from "../account";
import { WorkspaceRedirectSkeleton } from "../skeleton";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { WorkspaceContext } from "./WorkspaceContext";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

type DashboardLayoutProps = {
  user: User | null;
  lang: Lang;
  langMode: LangMode;
  theme: Theme;
  themeMode: ThemeMode;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onChangeLangMode: (mode: LangMode) => void;
  onChangeThemeMode: (mode: ThemeMode) => void;
};

export default function DashboardLayout({
  user,
  lang,
  onUpdateUser,
  onLogout,
}: DashboardLayoutProps) {
  const { workspace: currentSlug } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const workspacesQuery = trpc.workspace.list.useQuery();
  const workspaces = workspacesQuery.data ?? [];

  // Validate membership: getBySlug joins workspace_members so non-members get null
  const workspaceQuery = trpc.workspace.getBySlug.useQuery(
    { slug: currentSlug ?? "" },
    { enabled: Boolean(currentSlug) },
  );

  if (workspaceQuery.isLoading) {
    return <WorkspaceRedirectSkeleton />;
  }

  // Not a member or workspace doesn't exist → guard
  if (!workspaceQuery.isLoading && workspaceQuery.data === null) {
    return <Navigate to="/unauthorized" replace />;
  }

  const currentWorkspace = workspaceQuery.data ?? null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--ui-bg-subtle)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r bg-[var(--ui-sidebar-bg)] border-[var(--ui-sidebar-border)]">
        {/* Workspace switcher — top */}
        <div className="border-b border-[var(--ui-sidebar-border)]">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentSlug={currentSlug}
            lang={lang}
            onCreateNew={() => setCreateOpen(true)}
          />
        </div>

        {/* Navigation area — grows */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {/* Reserved for future nav items */}
        </nav>

        {/* User menu — bottom */}
        {user && (
          <div className="border-t border-[var(--ui-sidebar-border)]">
            <UserMenu
              user={user}
              lang={lang}
              onUpdateUser={onUpdateUser}
              onLogout={onLogout}
            />
          </div>
        )}
      </aside>

      {/* Scrollable main content */}
      <main className="flex-1 overflow-y-auto">
        <WorkspaceContext.Provider value={currentWorkspace}>
          <Outlet />
        </WorkspaceContext.Provider>
      </main>

      <CreateWorkspaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        lang={lang}
        onSuccess={(ws) => {
          setCreateOpen(false);
          navigate(`/dashboard/${ws.slug}`);
        }}
      />
    </div>
  );
}
