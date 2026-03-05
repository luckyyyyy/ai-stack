import type { UserSettings } from "@acme/types";
import type { User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/db/client";
import { getMessage, type Language } from "@/i18n";

export const toUserOutput = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as "admin" | "user",
  settings: (user.settings as UserSettings | null) ?? null,
});

const updateUserOrThrow = async (
  userId: string,
  data: Prisma.UserUpdateInput,
  notFoundMessage: string,
): Promise<User> => {
  try {
    return await prisma.user.update({ where: { id: userId }, data });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });
    }
    throw err;
  }
};

export class UserService {
  async getById(userId: string) {
    return prisma.user.findFirst({ where: { id: userId } });
  }

  async getByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }

  async checkEmailExists(email: string, excludeUserId?: string) {
    const existing = await prisma.user.findFirst({
      where: excludeUserId ? { email, id: { not: excludeUserId } } : { email },
      select: { id: true },
    });
    return !!existing;
  }

  async updateProfile(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      settings?: Partial<UserSettings> | null;
    },
    language: Language,
  ) {
    if (updates.email) {
      const emailExists = await this.checkEmailExists(updates.email, userId);
      if (emailExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: getMessage(language, "errors.user.emailInUse"),
        });
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (updates.name !== undefined) data.name = updates.name.trim();
    if (updates.email !== undefined) data.email = updates.email.trim();

    if (updates.settings !== undefined) {
      if (updates.settings === null) {
        data.settings = Prisma.DbNull;
      } else {
        const current = await prisma.user.findFirst({
          where: { id: userId },
          select: { settings: true },
        });
        const currentSettings =
          (current?.settings as UserSettings | null) ?? {};
        data.settings = { ...currentSettings, ...updates.settings };
      }
    }

    if (Object.keys(data).length === 0) {
      const user = await this.getById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: getMessage(language, "errors.user.notFound"),
        });
      }
      return user;
    }

    return updateUserOrThrow(
      userId,
      data,
      getMessage(language, "errors.user.notFound"),
    );
  }

  /**
   * Update avatarUrl in user settings.
   * Returns the previous avatarUrl so callers can clean up the old file in storage.
   */
  async updateAvatarUrl(
    userId: string,
    avatarUrl: string,
  ): Promise<{ updated: User; previousAvatarUrl: string | null }> {
    const current = await prisma.user.findFirst({
      where: { id: userId },
      select: { settings: true },
    });

    const currentSettings = (current?.settings as UserSettings | null) ?? {};
    const previousAvatarUrl = currentSettings.avatarUrl ?? null;
    const nextSettings = { ...currentSettings, avatarUrl };

    const updated = await updateUserOrThrow(
      userId,
      { settings: nextSettings },
      "User not found",
    );

    return { updated, previousAvatarUrl };
  }

  async deleteAvatar(userId: string, language: Language) {
    const current = await prisma.user.findFirst({
      where: { id: userId },
      select: { settings: true },
    });

    const currentSettings = (current?.settings as UserSettings | null) ?? {};
    const nextSettings = { ...currentSettings, avatarUrl: null };

    return updateUserOrThrow(
      userId,
      { settings: nextSettings },
      getMessage(language, "errors.user.notFound"),
    );
  }
}

export const userService = new UserService();
