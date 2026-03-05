---
applyTo: "**"
---

# Architecture & Structure

## Project Structure

```
packages/
  server/          # Backend (Hono + tRPC + Prisma)
    src/
      db/          # Database client
        client.ts  # Prisma client singleton
      prisma/
        schema.prisma  # Prisma schema (source of truth for DB tables)
      modules/     # Business modules
        auth/      # auth.service.ts, auth.router.ts, index.ts
        user/      # user.service.ts, user.router.ts, index.ts
        workspace/ # workspace.service.ts, workspace.router.ts, index.ts
        upload/    # upload.route.ts (Hono raw route, not tRPC)
      trpc/        # tRPC core: context.ts, init.ts, middlewares.ts, router.ts
      logger.ts    # NestJS-style colored logger
      main.ts      # Hono bootstrap

  web/             # Frontend (React + Vite)
    src/
      components/  # 业务组件 (depends on tRPC/API)
        site/      # SiteLayout, SiteHeader, HomePage
        dashboard/ # DashboardLayout, CreateWorkspaceModal
        account/   # UserMenu
      pages/       # Route-level page components
      hooks/       # Custom React hooks
      lib/         # trpc.ts, i18n.ts

  components/      # 通用 UI 组件库 (no business logic, cross-project reusable)
  i18n/            # Internationalization resources (zh/en)
  types/           # Shared TypeScript types & Zod schemas
```

## Data Layer Separation

| Layer | Type | Purpose | Location |
|-------|------|---------|----------|
| **Database** | Prisma Schema | Table definitions | `packages/server/prisma/schema.prisma` |
| **Types** | TypeScript + Zod | Shared type definitions | `packages/types/src/*.ts` |
| **Services** | Service Classes | Business logic | `packages/server/src/modules/[module]/[module].service.ts` |
| **API** | tRPC Routers | API endpoints | `packages/server/src/modules/[module]/[module].router.ts` |

## Component Architecture (通用组件 vs 业务组件)

| 类型 | 位置 | 特征 | 示例 |
|------|------|------|------|
| **通用组件** | `packages/components` | 与业务无关，可跨项目复用 | Button, Modal, Loading |
| **业务组件** | `packages/web/src/components` | 依赖 tRPC/API，含业务逻辑 | UserMenu, DashboardLayout |

**决策流程：**
```
需要 UI 组件？
  → 先查 packages/components/src/
  → 找到？直接复用
  → 找到但不够？修改通用组件，添加 props 支持新需求
  → 没找到且与业务无关？在 packages/components 中新建
  → 没找到且依赖 API？在 packages/web/src/components 中新建
```

## tRPC Router Pattern

```typescript
// packages/server/src/modules/user/user.router.ts
import { UserSchema } from "@acme/types";
import { Router, Query, Ctx, UseMiddlewares } from "../../trpc/decorators";
import { requireUser } from "../../trpc/middlewares";
import type { Context } from "../../trpc/context";
import { userService, toUserOutput } from "./user.service";

@Router({ alias: "user" })
export class UserRouter {
  @Query({ output: UserSchema })
  @UseMiddlewares(requireUser)
  async getProfile(@Ctx() ctx: Context) {
    const user = await userService.getById(ctx.userId!);
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
    return toUserOutput(user);
  }
}
```

**Best practices:**
1. Always define `input`/`output` schemas using Zod
2. Use `@UseMiddlewares(requireUser)` for protected routes
3. Transform DB entities via `toXxxOutput()` helpers — never expose raw DB types
4. Throw `TRPCError` with proper error codes
5. No `.module.ts` — services are plain singletons (`export const userService = new UserService()`)

## Logger Pattern

```typescript
import { Logger } from "../logger";
const logger = new Logger("MyContext");
logger.log("Something happened");
logger.warn("Watch out");
logger.error("Something failed");
```
