import type { Workspace } from "@prisma/client";
import { prisma } from "@/db/client";
import { normalizeLanguage } from "@/i18n";
import { getCookieValue, SESSION_COOKIE_NAME } from "@/utils/session";

export const createContext = async (req: Request, resHeaders: Headers) => {
  const cookieHeader = req.headers.get("cookie") ?? undefined;
  const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  let userId: string | undefined;
  if (sessionId) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, expiresAt: { gt: new Date() } },
      select: { userId: true },
    });
    userId = session?.userId;
  }
  const workspaceKey = req.headers.get("x-workspace-id");
  const languageHeader =
    req.headers.get("x-lang") ?? req.headers.get("accept-language");
  const language = normalizeLanguage(
    typeof languageHeader === "string" ? languageHeader : undefined,
  );

  return {
    prisma,
    userId,
    sessionId,
    workspaceKey: workspaceKey ?? undefined,
    workspace: undefined as Workspace | undefined,
    language,
    resHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/** Narrowed context guaranteed by `requireUser` middleware — userId is always present */
export type AuthContext = Omit<Context, "userId"> & { userId: string };
