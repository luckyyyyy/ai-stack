import { authRouter } from "@/modules/auth/auth.router";
import { userRouter } from "@/modules/user/user.router";
import { workspaceRouter } from "@/modules/workspace/workspace.router";
import { router } from "./init";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
