import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { InferSelectModel } from "drizzle-orm";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, workspaces } from "@/db/schema";
import { normalizeLanguage } from "@/i18n";
import { getCookieValue, SESSION_COOKIE_NAME } from "@/utils/session";

type Workspace = InferSelectModel<typeof workspaces>;

export const createContext = async ({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) => {
  const cookieHeader = req.headers.get("cookie") ?? undefined;
  const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  let userId: string | undefined;
  if (sessionId) {
    const [session] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
      )
      .limit(1);
    userId = session?.userId;
  }
  const workspaceKey = req.headers.get("x-workspace-id");
  const languageHeader =
    req.headers.get("x-lang") ?? req.headers.get("accept-language");
  const language = normalizeLanguage(
    typeof languageHeader === "string" ? languageHeader : undefined,
  );

  return {
    db,
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
