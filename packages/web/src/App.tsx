import type { User } from "@acme/types";
import { QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useEffect, useMemo, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { HomePage, SiteLayout } from "./components/site";
import { useAuth, useLang, useTheme } from "./hooks";
import { useMessage } from "./hooks/useMessage";
import i18n from "./lib/i18n";
import { saveUser } from "./lib/storage";
import { trpc } from "./lib/trpc";
import {
  DashboardIndexRedirect,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  UnauthorizedPage,
  WorkspacePage,
} from "./pages";

function AppContent() {
  const { user, isAuthed, login, updateUser, logout } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { lang, langMode, setLangMode } = useLang();

  const handleLogin = (nextUser: User) => {
    login(nextUser);
    if (nextUser.settings?.themeMode) setThemeMode(nextUser.settings.themeMode);
    if (nextUser.settings?.langMode) setLangMode(nextUser.settings.langMode);
  };

  // Dev-only: auto login as dev user when not authenticated.
  // Use raw trpc client (utils.client) to bypass QueryClient global onError handler.
  const trpcUtils = trpc.useUtils();
  const devAutoLoginDoneRef = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    if (!import.meta.env.DEV || isAuthed || devAutoLoginDoneRef.current) return;
    devAutoLoginDoneRef.current = true;
    trpcUtils.client.auth.devLogin
      .mutate()
      .then(({ user: devUser }) => handleLogin(devUser))
      .catch(() => {}); // silently ignore (e.g. server in production mode)
  }, []);

  useEffect(() => {
    if (user?.settings?.themeMode) setThemeMode(user.settings.themeMode);
    if (user?.settings?.langMode) setLangMode(user.settings.langMode);
  }, [
    user?.settings?.themeMode,
    user?.settings?.langMode,
    setLangMode,
    setThemeMode,
  ]);

  return (
    <Routes>
      <Route element={<GuestRoute isAuthed={isAuthed} />}>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/register"
          element={<RegisterPage onLogin={handleLogin} />}
        />
      </Route>
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        element={
          <SiteLayout
            user={user}
            theme={theme}
            themeMode={themeMode}
            lang={lang}
            langMode={langMode}
            onUpdateUser={updateUser}
            onLogout={logout}
            onChangeLangMode={setLangMode}
            onChangeThemeMode={setThemeMode}
          />
        }
      >
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route element={<ProtectedRoute isAuthed={isAuthed} />}>
        <Route path="/dashboard" element={<DashboardIndexRedirect />} />
        <Route
          path="/dashboard/:workspace"
          element={
            <DashboardLayout
              user={user}
              lang={lang}
              langMode={langMode}
              theme={theme}
              themeMode={themeMode}
              onUpdateUser={updateUser}
              onLogout={logout}
              onChangeLangMode={setLangMode}
              onChangeThemeMode={setThemeMode}
            />
          }
        >
          <Route index element={<WorkspacePage user={user} />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App({
  trpcClient,
}: {
  trpcClient: ReturnType<typeof trpc.createClient>;
}) {
  const message = useMessage();

  const isAuthPage = () =>
    typeof window !== "undefined" &&
    ["/login", "/register"].includes(window.location.pathname);

  const redirectToLogin = () => {
    if (typeof window === "undefined" || isAuthPage()) return;
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?${new URLSearchParams({ redirect })}`);
  };

  const redirectToUnauthorized = () => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/unauthorized")
      window.location.assign("/unauthorized");
  };

  const handleTrpcError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      const code = error.data?.code;
      if (code === "UNAUTHORIZED") {
        saveUser(null);
        message.error(error.message || i18n.t("errors.common.unauthorized"));
        redirectToLogin();
        return;
      }
      if (code === "FORBIDDEN") {
        message.error(error.message || i18n.t("errors.common.forbidden"));
        redirectToUnauthorized();
        return;
      }
      message.error(error.message || i18n.t("errors.common.requestFailed"));
      return;
    }
    if (error instanceof Error) {
      message.error(error.message || i18n.t("errors.common.requestFailed"));
    }
  };

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1 },
          mutations: { onError: handleTrpcError },
        },
      }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: handleTrpcError intentionally omits stable i18n/message deps
    [handleTrpcError],
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <AppContent />
    </trpc.Provider>
  );
}
