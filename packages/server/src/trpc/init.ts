import { initTRPC, TRPCError } from "@trpc/server";
import { getMessage } from "@/i18n";
import type { AuthContext, Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: getMessage(ctx.language, "errors.common.unauthorized"),
    });
  }
  return next({ ctx: ctx as AuthContext });
});
