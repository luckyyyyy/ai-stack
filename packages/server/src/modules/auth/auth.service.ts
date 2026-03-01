import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, users, workspaceMembers, workspaces } from "@/db/schema";
import { SESSION_COOKIE_NAME } from "@/utils/session";
import { slugify } from "@/utils/slugify";

const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), derived);
};

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const MAX_SLUG_ATTEMPTS = 100;

export class AuthService {
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async getDefaultWorkspaceSlug(userId: string) {
    const [workspace] = await db
      .select({ slug: workspaces.slug })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(workspaces.createdAt)
      .limit(1);
    return workspace?.slug ?? null;
  }

  async ensureUniqueWorkspaceSlug(base: string) {
    const baseSlug = slugify(base) || "workspace";
    let slug = baseSlug;
    let suffix = 1;

    while (suffix <= MAX_SLUG_ATTEMPTS) {
      const [existing] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1);
      if (!existing) return slug;
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    throw new Error(
      `Could not generate a unique workspace slug for "${base}" after ${MAX_SLUG_ATTEMPTS} attempts`,
    );
  }

  async createSession(userId: string) {
    const expiresAt = new Date(
      Date.now() + SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
    );
    const [session] = await db
      .insert(sessions)
      .values({ userId, expiresAt })
      .returning({ id: sessions.id });
    return session.id;
  }

  async deleteSession(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async registerUser(input: { name: string; email: string; password: string }) {
    const workspaceName = `${input.name}的空间站`;
    const workspaceSlug = await this.ensureUniqueWorkspaceSlug(workspaceName);

    const result = await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: hashPassword(input.password),
          role: "user",
        })
        .returning();

      const [createdWorkspace] = await tx
        .insert(workspaces)
        .values({
          slug: workspaceSlug,
          name: workspaceName,
          description: "默认工作空间",
        })
        .returning();

      await tx.insert(workspaceMembers).values({
        workspaceId: createdWorkspace.id,
        userId: createdUser.id,
        role: "owner",
      });

      return { user: createdUser, workspace: createdWorkspace };
    });

    return result;
  }

  async getOrCreateDevUser() {
    const devEmail = "dev@local.dev";
    const devName = "Dev User";

    let user = await this.getUserByEmail(devEmail);
    if (!user) {
      const result = await this.registerUser({
        name: devName,
        email: devEmail,
        password: "dev-auto-login-no-password",
      });
      user = result.user;
    }
    return user;
  }

  setSessionCookie(resHeaders: Headers, sessionId: string) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    resHeaders.append(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}; Path=/${secure}`,
    );
  }

  clearSessionCookie(resHeaders: Headers) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    resHeaders.append(
      "Set-Cookie",
      `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/${secure}`,
    );
  }
}

export const authService = new AuthService();
