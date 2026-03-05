import { TRPCError } from "@trpc/server";
import { getMessage } from "@/i18n";
import { protectedProcedure } from "./init";

/**
 * A protected procedure that also resolves and validates workspace membership.
 * Puts `workspace` on ctx. Use in workspace-scoped routes.
 */
export const workspaceProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.workspaceKey) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: getMessage(ctx.language, "errors.common.missingWorkspace"),
      });
    }

    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );

    const workspace = await ctx.prisma.workspace.findFirst({
      where: isUuid(ctx.workspaceKey)
        ? { OR: [{ id: ctx.workspaceKey }, { slug: ctx.workspaceKey }] }
        : { slug: ctx.workspaceKey },
    });

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: getMessage(ctx.language, "errors.workspace.notFound"),
      });
    }

    const membership = await ctx.prisma.workspaceMember.findFirst({
      where: { workspaceId: workspace.id, userId: ctx.userId },
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: getMessage(ctx.language, "errors.common.workspaceForbidden"),
      });
    }

    return next({ ctx: { ...ctx, workspace } });
  },
);
