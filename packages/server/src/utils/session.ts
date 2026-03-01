/**
 * Shared session / cookie utilities.
 * Used by tRPC context, upload routes, and auth service to avoid duplication.
 */
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/client";
import { sessions } from "../db/schema";

export const SESSION_COOKIE_NAME = "SESSION_ID";

export const getCookieValue = (
  cookieHeader: string | undefined,
  name: string,
): string | undefined => {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
};

/**
 * Resolve userId from a raw Cookie header string.
 * Returns undefined when the session is missing, invalid, or expired.
 */
export const resolveSessionUserId = async (
  cookieHeader: string | undefined,
): Promise<string | undefined> => {
  const sessionId = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  if (!sessionId) return undefined;
  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return session?.userId;
};
