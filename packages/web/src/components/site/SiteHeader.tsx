import type { User } from "@acme/types";
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/account";
import type { Lang, LangMode, ThemeMode } from "@/lib/types";

type SiteHeaderProps = {
  user: User | null;
  theme: "light" | "dark";
  themeMode: ThemeMode;
  lang: Lang;
  langMode: LangMode;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onChangeLangMode: (mode: LangMode) => void;
  onChangeThemeMode: (mode: ThemeMode) => void;
};

export default function SiteHeader({
  user,
  lang,
  onUpdateUser,
  onLogout,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ui-border)] bg-[var(--ui-bg)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-[#007fd4] to-[#4fc1ff]" />
          <span className="text-lg font-semibold">Acme</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu
              user={user}
              lang={lang}
              onUpdateUser={onUpdateUser}
              onLogout={onLogout}
            />
          ) : (
            <Link
              to="/login"
              className="rounded-md px-4 py-1.5 text-sm font-semibold transition-colors bg-[var(--ui-btn-primary-bg)] hover:bg-[var(--ui-btn-primary-bg-hover)] text-[var(--ui-btn-primary-text)]"
            >
              {lang === "zh" ? "登录" : "Login"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
