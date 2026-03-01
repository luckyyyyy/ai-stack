import { UserSchema, UserSettingsPatchSchema } from "@acme/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMessage } from "../../i18n";
import type { AuthContext } from "../../trpc/context";
import {
  Ctx,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from "../../trpc/decorators";
import { requireUser } from "../../trpc/middlewares";
import { toUserOutput, userService } from "./user.service";

export const userProfileOutput = UserSchema;

export const userUpdateInput = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  settings: UserSettingsPatchSchema.nullable().optional(),
});

@Router({ alias: "user" })
export class UserRouter {
  @Query({ output: userProfileOutput })
  @UseMiddlewares(requireUser)
  async getProfile(@Ctx() ctx: AuthContext) {
    const user = await userService.getById(ctx.userId);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: getMessage(ctx.language, "errors.user.notFound"),
      });
    }
    return toUserOutput(user);
  }

  @Mutation({ input: userUpdateInput, output: userProfileOutput })
  @UseMiddlewares(requireUser)
  async updateProfile(
    input: z.infer<typeof userUpdateInput>,
    @Ctx() ctx: AuthContext,
  ) {
    const updated = await userService.updateProfile(
      ctx.userId,
      {
        name: input.name,
        email: input.email,
        settings: input.settings,
      },
      ctx.language,
    );
    return toUserOutput(updated);
  }

  @Mutation({ output: userProfileOutput })
  @UseMiddlewares(requireUser)
  async deleteAvatar(@Ctx() ctx: AuthContext) {
    const updated = await userService.deleteAvatar(ctx.userId, ctx.language);
    return toUserOutput(updated);
  }
}
