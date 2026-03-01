import { UserProfileOutputSchema, UserUpdateInputSchema } from "@acme/types";
import { TRPCError } from "@trpc/server";
import { getMessage } from "@/i18n";
import { protectedProcedure, router } from "@/trpc/init";
import { toUserOutput, userService } from "./user.service";

export const userRouter = router({
  getProfile: protectedProcedure
    .output(UserProfileOutputSchema)
    .query(async ({ ctx }) => {
      const user = await userService.getById(ctx.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: getMessage(ctx.language, "errors.user.notFound"),
        });
      }
      return toUserOutput(user);
    }),

  updateProfile: protectedProcedure
    .input(UserUpdateInputSchema)
    .output(UserProfileOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await userService.updateProfile(
        ctx.userId,
        { name: input.name, email: input.email, settings: input.settings },
        ctx.language,
      );
      return toUserOutput(updated);
    }),

  deleteAvatar: protectedProcedure
    .output(UserProfileOutputSchema)
    .mutation(async ({ ctx }) => {
      const updated = await userService.deleteAvatar(ctx.userId, ctx.language);
      return toUserOutput(updated);
    }),
});
