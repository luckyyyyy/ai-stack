import {
  AuthOutputSchema,
  LoginInputSchema,
  LogoutOutputSchema,
  RegisterInputSchema,
} from "@acme/types";
import { TRPCError } from "@trpc/server";
import { getMessage } from "@/i18n";
import { toUserOutput } from "@/modules/user/user.service";
import { publicProcedure, router } from "@/trpc/init";
import { authService, verifyPassword } from "./auth.service";

export const authRouter = router({
  login: publicProcedure
    .input(LoginInputSchema)
    .output(AuthOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await authService.getUserByEmail(input.email);

      if (!user || !verifyPassword(input.password, user.passwordHash)) {
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

      return { user: toUserOutput(user), defaultWorkspaceSlug };
    }),

  register: publicProcedure
    .input(RegisterInputSchema)
    .output(AuthOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await authService.getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: getMessage(
            ctx.language,
            "errors.auth.emailAlreadyRegistered",
          ),
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
    }),

  logout: publicProcedure
    .output(LogoutOutputSchema)
    .mutation(async ({ ctx }) => {
      if (ctx.sessionId) {
        await authService.deleteSession(ctx.sessionId);
      }
      authService.clearSessionCookie(ctx.resHeaders);
      return { success: true };
    }),

  devLogin: publicProcedure
    .output(AuthOutputSchema)
    .mutation(async ({ ctx }) => {
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
      return { user: toUserOutput(user), defaultWorkspaceSlug };
    }),
});
