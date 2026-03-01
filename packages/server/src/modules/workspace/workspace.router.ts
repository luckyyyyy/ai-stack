import {
  CreateWorkspaceInputSchema,
  DeleteWorkspaceInputSchema,
  UpdateWorkspaceInputSchema,
  WorkspaceSchema,
} from "@acme/types";
import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { toWorkspaceOutput, workspaceService } from "./workspace.service";

export const workspaceRouter = router({
  list: protectedProcedure
    .output(z.array(WorkspaceSchema))
    .query(async ({ ctx }) => {
      const workspaces = await workspaceService.listByUser(ctx.userId);
      return workspaces.map(toWorkspaceOutput);
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(WorkspaceSchema.nullable())
    .query(async ({ input, ctx }) => {
      const workspace = await workspaceService.getBySlug(
        input.slug,
        ctx.userId,
      );
      return workspace ? toWorkspaceOutput(workspace) : null;
    }),

  create: protectedProcedure
    .input(CreateWorkspaceInputSchema)
    .output(WorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      const workspace = await workspaceService.create(input, ctx.userId);
      return toWorkspaceOutput(workspace);
    }),

  update: protectedProcedure
    .input(UpdateWorkspaceInputSchema)
    .output(WorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await workspaceService.update(
        input.id,
        input,
        ctx.userId,
        ctx.language,
      );
      return toWorkspaceOutput(updated);
    }),

  delete: protectedProcedure
    .input(DeleteWorkspaceInputSchema)
    .output(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return workspaceService.delete(input.id, ctx.userId, ctx.language);
    }),
});
