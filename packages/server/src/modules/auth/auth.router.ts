import { UserSchema } from "@acme/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMessage } from "../../i18n";
import type { Context } from "../../trpc/context";
import { Ctx, Mutation, Router } from "../../trpc/decorators";
import { authService, toUserOutput } from "./auth.service";

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const userOutput = UserSchema;

export const authOutput = z.object({
  user: userOutput,
  defaultWorkspaceSlug: z.string(),
});

export const logoutOutput = z.object({
  success: z.boolean(),
});

@Router({ alias: "auth" })
export class AuthRouter {
  @Mutation({ input: loginInput, output: authOutput })
  async login(input: z.infer<typeof loginInput>, @Ctx() ctx: Context) {
    const user = await authService.getUserByEmail(input.email);

    if (
      !user ||
      !authService.verifyPassword(input.password, user.passwordHash)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: getMessage(ctx.language, "errors.auth.invalidCredentials"),
      });
    }

    const defaultWorkspaceSlug = await authService.getDefaultWorkspaceSlug(
      user.id,
    );

    if (!defaultWorkspaceSlug) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: getMessage(
          ctx.language,
          "errors.auth.defaultWorkspaceNotFound",
        ),
      });
    }

    const sessionId = await authService.createSession(user.id);
    authService.setSessionCookie(ctx.resHeaders, sessionId);

    return {
      user: toUserOutput(user),
      defaultWorkspaceSlug,
    };
  }

  @Mutation({ input: registerInput, output: authOutput })
  async register(input: z.infer<typeof registerInput>, @Ctx() ctx: Context) {
    const existing = await authService.getUserByEmail(input.email);
    if (existing) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: getMessage(ctx.language, "errors.auth.emailAlreadyRegistered"),
      });
    }

    const name = input.email.split("@")[0];
    const result = await authService.registerUser({ ...input, name });

    const sessionId = await authService.createSession(result.user.id);
    authService.setSessionCookie(ctx.resHeaders, sessionId);

    return {
      user: toUserOutput(result.user),
      defaultWorkspaceSlug: result.workspace.slug,
    };
  }

  @Mutation({ output: logoutOutput })
  async logout(@Ctx() ctx: Context) {
    if (ctx.sessionId) {
      await authService.deleteSession(ctx.sessionId);
    }
    authService.clearSessionCookie(ctx.resHeaders);
    return { success: true };
  }

  @Mutation({ output: authOutput })
  async devLogin(@Ctx() ctx: Context) {
    if (process.env.NODE_ENV === "production") {
      throw new TRPCError({ code: "FORBIDDEN", message: "仅在开发环境可用" });
    }
    const user = await authService.getOrCreateDevUser();
    const defaultWorkspaceSlug = await authService.getDefaultWorkspaceSlug(
      user.id,
    );
    if (!defaultWorkspaceSlug) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dev workspace not found",
      });
    }
    const sessionId = await authService.createSession(user.id);
    authService.setSessionCookie(ctx.resHeaders, sessionId);
    return {
      user: toUserOutput(user),
      defaultWorkspaceSlug,
    };
  }
}
