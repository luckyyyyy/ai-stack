import { Button, Input } from "@acme/components";
import type { User } from "@acme/types";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { trpc } from "../../lib/trpc";

type LoginPageProps = {
  onLogin: (user: User) => void;
  initialMode?: "login" | "register";
};

export default function LoginPage({
  onLogin,
  initialMode = "login",
}: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = (
    mode === "login" ? loginMutation.error : registerMutation.error
  )?.message;
  const isPending = loginMutation.isPending || registerMutation.isPending;
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    setMode(initialMode);
    setEmail("");
    setPassword("");
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const result = await loginMutation.mutateAsync({ email, password });
      onLogin(result.user as User);
      navigate(redirect || `/dashboard/${result.defaultWorkspaceSlug}`);
    } else {
      const result = await registerMutation.mutateAsync({ email, password });
      onLogin(result.user as User);
      navigate(redirect || `/dashboard/${result.defaultWorkspaceSlug}`);
    }
  };

  const switchMode = () => {
    const next = mode === "login" ? "register" : "login";
    setMode(next);
    setEmail("");
    setPassword("");
    const q = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
    navigate(next === "login" ? `/login${q}` : `/register${q}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 bg-[var(--ui-bg-subtle)]">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border p-8 bg-[var(--ui-bg)] border-[var(--ui-border)]">
          <h1 className="text-xl font-semibold mb-6 text-[var(--ui-text)]">
            {mode === "login" ? "登录" : "注册"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="me@example.com"
              required
            />
            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p
                className="rounded-md border px-3 py-2 text-sm
                  text-[var(--ui-danger-text)] bg-[var(--ui-danger-bg)]
                  border-[var(--ui-danger-text)]"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={isPending}
              className="mt-1"
            >
              {mode === "login" ? "登录" : "注册"}
            </Button>

            <button
              type="button"
              onClick={switchMode}
              className="cursor-pointer w-full text-sm hover:underline text-[var(--ui-text-muted)]"
            >
              {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
