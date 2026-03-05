/**
 * Shared session / cookie utilities.
 * Used by tRPC context, upload routes, and auth service to avoid duplication.
 */
import { prisma } from "@/db/client";

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
  const session = await prisma.session.findFirst({
    where: { id: sessionId, expiresAt: { gt: new Date() } },
    select: { userId: true },
  });
  return session?.userId;
};
