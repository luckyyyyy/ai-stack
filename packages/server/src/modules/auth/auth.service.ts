import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/db/client";
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
    return prisma.user.findFirst({ where: { email } });
  }

  async getDefaultWorkspaceSlug(userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: { select: { slug: true } } },
      orderBy: { workspace: { createdAt: "asc" } },
    });
    return member?.workspace.slug ?? null;
  }

  async ensureUniqueWorkspaceSlug(base: string) {
    const baseSlug = slugify(base) || "workspace";
    let slug = baseSlug;
    let suffix = 1;

    while (suffix <= MAX_SLUG_ATTEMPTS) {
      const existing = await prisma.workspace.findFirst({
        where: { slug },
        select: { id: true },
      });
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
    const session = await prisma.session.create({
      data: { userId, expiresAt },
      select: { id: true },
    });
    return session.id;
  }

  async deleteSession(sessionId: string) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  async registerUser(input: { name: string; email: string; password: string }) {
    const workspaceName = `${input.name}的空间站`;
    const workspaceSlug = await this.ensureUniqueWorkspaceSlug(workspaceName);

    return prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: hashPassword(input.password),
          role: "user",
        },
      });

      const createdWorkspace = await tx.workspace.create({
        data: {
          slug: workspaceSlug,
          name: workspaceName,
          description: "默认工作空间",
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: createdWorkspace.id,
          userId: createdUser.id,
          role: "owner",
        },
      });

      return { user: createdUser, workspace: createdWorkspace };
    });
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
