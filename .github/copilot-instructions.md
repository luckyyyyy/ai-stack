# Project Overview

This is a TypeScript monorepo managed with pnpm workspaces.
It consists of a full-stack scaffold with a Hono backend, React frontend, and shared type definitions.

## Project Structure

- **packages/server**: Hono backend with tRPC API layer (custom decorator system, no NestJS)
- **packages/web**: React frontend (Vite-based, no antd — plain TailwindCSS)
- **packages/types**: Shared TypeScript types and Zod schemas
- **packages/components**: 通用 UI 组件库（与业务无关的可复用组件）
- **packages/i18n**: 国际化资源包（多语言翻译资源）

## Tech Stack

### Backend (packages/server)
- **Framework**: Hono + @hono/node-server
- **API Layer**: tRPC v11 with custom class-based decorator system (`@Router`, `@Query`, `@Mutation`, `@Ctx`, `@UseMiddlewares`)
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM 0.45
- **Validation**: Zod v4 for runtime schema validation
- **Runtime**: Node.js + TypeScript via `tsx watch`
- **Logging**: Built-in `Logger` class (`src/logger.ts`) — NestJS-style colored output

### Frontend (packages/web)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4 only — no antd, no @ant-design/icons
- **State Management**: TanStack Query (React Query) v5
- **Routing**: React Router DOM v7
- **API Client**: tRPC Client (types auto-generated from server)
- **Internationalization**: i18next + react-i18next

### Shared (packages/types)
- **TypeScript** types and interfaces
- **Zod v4** schemas for validation and type inference
- Shared between server and client for end-to-end type safety

### Development Tools
- **Package Manager**: pnpm 10.15.1 (strict workspace protocol)
- **Code Quality**: Biome for linting & formatting (don't use Prettier/ESLint)
- **Database Container**: Docker Compose with PostgreSQL 16
- **Concurrent Tasks**: Concurrently for running multiple dev servers

## Files Structure

```
packages/
  server/          # Backend (Hono + tRPC + Drizzle)
    src/
      db/          # Database client and schema definitions
        schema.ts  # Drizzle schema (PO - Persistent Objects)
        client.ts  # Database connection
      modules/     # Business modules (plain classes, no NestJS DI)
        auth/      # Authentication module
          auth.service.ts  # Business logic
          auth.router.ts   # tRPC router (decorated class)
          index.ts         # Module exports + side-effect import
        user/      # User module
          user.service.ts
          user.router.ts
          index.ts
        workspace/ # Workspace module
          workspace.service.ts
          workspace.router.ts
          index.ts
        index.ts   # Imports all modules to register routers
      trpc/        # tRPC core configuration
        context.ts         # Request context (fetch adapter)
        middlewares.ts     # requireUser middleware
        decorators.ts      # @Router, @Query, @Mutation, @Ctx, @UseMiddlewares
        router.builder.ts  # Builds tRPC router from decorated classes
        router.ts          # Assembles appRouter
        @generated/
          app-router.ts    # Shared type file imported by frontend
      logger.ts    # Colored logger (NestJS-style output)
      main.ts      # Hono bootstrap (cors + trpcServer)
    drizzle.config.ts

  web/             # Frontend (React + Vite)
    src/
      components/  # 业务组件（依赖 API、包含业务逻辑）
        site/      # 官网页面组件 (SiteLayout, SiteHeader, HomePage)
        dashboard/ # 控制台组件 (DashboardLayout, CreateWorkspaceModal)
        account/   # 用户账户组件 (UserMenu)
      pages/       # 页面组件（路由处理）
        dashboard/ # WorkspacePage, DashboardIndexRedirect
        login/     # LoginPage, RegisterPage
      hooks/       # React custom hooks
      lib/         # Utilities and configurations
        trpc.ts    # tRPC client setup
        i18n.ts    # i18next configuration (uses @acme/i18n)
    index.html
    vite.config.ts

  components/      # 通用 UI 组件库
    src/
      index.ts     # Main exports

  i18n/            # 国际化资源包
    src/
      index.ts
      locales/
        zh.ts
        en.ts

  types/           # Shared types
    src/
      user.ts
      workspace.ts
      index.ts
```

## Build & Test

- **Install dependencies**: `pnpm install`
- **Start dev servers**: `make dev` (database + server + web concurrently)
  - Server: http://localhost:4000
  - Web: http://localhost:5173
- **Build for production**: `pnpm build`
- **Lint/Format**: `make lint` (Biome check) or `pnpm format` (auto-fix)
- **Type check**: `make tsc` (runs `tsc --noEmit` across all packages in parallel)
- **Full CI check**: `make lint && make tsc` (must pass before committing)
- **Database**:
  - Start: `pnpm db:up` (Docker Compose)
  - Stop: `pnpm db:down`
  - Migrate: `pnpm db:migrate`

> **强制要求**：每次提交代码前必须确保 `make lint && make tsc` 无报错。
> **注意**：只需修复**本次改动引入的** tsc / lint 错误；非本次修改造成的已有错误无需处理。

## Architecture Patterns

### Data Layer Separation

| Layer | Type | Purpose | Location |
|-------|------|---------|----------|
| **Database** | Drizzle Schema | Database table definitions | `packages/server/src/db/schema.ts` |
| **Types** | TypeScript + Zod | Shared type definitions and schemas | `packages/types/src/*.ts` |
| **Services** | Service Classes | Business logic layer | `packages/server/src/modules/[module]/[module].service.ts` |
| **API** | tRPC Routers | API endpoints with validation | `packages/server/src/modules/[module]/[module].router.ts` |

### Type & Schema Pattern

**All types and schemas are defined in `packages/types`:**

```typescript
// packages/types/src/user.ts
import { z } from "zod";

export const UserSettingsSchema = z.object({
  avatarUrl: z.string().nullable().optional(),
  langMode: z.enum(["auto", "zh", "en"]).optional(),
  themeMode: z.enum(["auto", "light", "dark"]).optional()
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  settings: UserSettingsSchema.nullable().optional()
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type User = z.infer<typeof UserSchema>;
```

**Key Principles:**
1. **Zod schemas are the single source of truth** — types are inferred via `z.infer<>`
2. **Runtime + Compile-time safety** — Zod validates at runtime, TypeScript at compile-time
3. **Shared between server and client** — ensures end-to-end type safety

### tRPC Router Pattern

**No NestJS, no `.module.ts` — plain classes with decorators:**

```typescript
// packages/server/src/modules/user/user.service.ts
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import type { UserSettings } from "@acme/types";

export const toUserOutput = (user: typeof users.$inferSelect) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as "admin" | "user",
  settings: (user.settings as UserSettings | null) ?? null
});

export class UserService {
  async getById(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ?? null;
  }
}

export const userService = new UserService();
```

```typescript
// packages/server/src/modules/user/user.router.ts
import { z } from "zod";
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

```typescript
// packages/server/src/modules/user/index.ts
// Side-effect import registers the router via @Router decorator
export * from "./user.service";
export * from "./user.router";
```

**Router Best Practices:**
1. **Always define input/output schemas** using Zod
2. **Use `@UseMiddlewares(requireUser)`** for protected routes
3. **Transform database entities** before returning via `toXxxOutput()` helpers
4. **Never expose database entities directly** — always transform to clean API types
5. **Throw `TRPCError`** for error handling with proper error codes
6. **No `.module.ts` files** — no NestJS DI; services are plain singletons (`export const userService = new UserService()`)

### Logger Pattern

Use the built-in `Logger` class for structured output:

```typescript
import { Logger } from "../logger";

const logger = new Logger("MyContext");
logger.log("Something happened");
logger.warn("Watch out");
logger.error("Something failed");
```

Output format (NestJS-style, colored):
```
[Hono] 1234  - 03/02/2026, 12:00:00 AM      LOG  [MyContext]  Something happened
```

## Coding Guidelines

### General TypeScript Rules

- Always prefer **async/await** over `.then()`
- Use **arrow functions** for consistency
- Avoid `any`; prefer `unknown` with proper type narrowing
- **Zod v4** schemas are mandatory for all runtime validation and API contracts
- **Import order**: Node built-ins → external packages → internal modules → relative imports

### React Guidelines

- Use **functional components + hooks only** (no class components)
- Type props with `interface Props {}`
- Prefer explicit function typing: `function Component(props: Props) {}`
- Keep components small and focused (max ~150 lines)
- Use TanStack Query for all tRPC calls
- Prefer controlled components over uncontrolled
- **No antd** — use plain HTML elements + TailwindCSS classes

### Component Architecture (通用组件 vs 业务组件)

| 类型 | 位置 | 特征 | 示例 |
|------|------|------|------|
| **通用组件** | `packages/components` | 与业务逻辑无关，可跨项目复用 | Button, Modal, Loading |
| **业务组件** | `packages/web/src/components` | 依赖 tRPC/API，包含业务逻辑 | UserMenu, DashboardLayout |

**组件开发工作流（必须遵守）：**

1. **先查找** — 开发任何 UI 元素前，先检查 `packages/components` 是否已有可复用组件
2. **优先通用化** — 新组件默认放入 `packages/components`，除非它明确依赖 API 或业务逻辑
3. **按需扩展** — 若现有通用组件不满足需求，**修改该组件**以支持新用法，而非绕过它或重复实现
4. **禁止重复造轮子** — 不允许在 `packages/web` 中重新实现 `packages/components` 已有的功能

**决策流程：**
```
需要一个 UI 组件？
  → 先查 packages/components/src/
  → 找到了？直接复用
  → 找到但功能不够？修改通用组件，添加 props 支持新需求
  → 没找到且与业务无关？在 packages/components 中新建
  → 没找到且依赖 API/业务逻辑？在 packages/web/src/components 中新建
```

**通用组件放置标准：**
- ✅ 纯 UI 展示组件（Button, Badge, Tag, Avatar）
- ✅ 布局组件（Container, Grid, Stack）
- ✅ 反馈组件（Loading, Empty, ErrorBoundary）
- ❌ 不依赖 tRPC 或具体 API
- ❌ 不包含业务逻辑

### File Size Guidelines

**单一文件不应超过 500 行**。超出时拆分：

```
// ✅ 应该：拆分为多个文件
BigComponent/
  index.tsx          # 主组件
  SubComponentA.tsx  # 子组件
  useBigComponent.ts # 自定义 hook
  types.ts           # 类型定义
```

### Database & ORM (Drizzle)

- Schema definitions live in `packages/server/src/db/schema.ts`
- Use `$inferSelect` and `$inferInsert` for type inference
- Never expose database entities directly through API boundaries

### tRPC Best Practices

- **Input validation**: All procedures must define `input:` with Zod schema
- **Output validation**: Define `output:` schema for all queries/mutations
- **Middleware**: `@UseMiddlewares(requireUser)` for protected routes
- **Error handling**: Throw `TRPCError` with appropriate error codes
- **Context**: Access auth context via `@Ctx()` decorator
- **Generated types**: Update `packages/server/src/trpc/@generated/app-router.ts` when adding/removing routers

### Naming Conventions

| Entity | Schema File | Type Export | Router Class |
|--------|-------------|-------------|--------------|
| User | `user.ts` | `User`, `UserSettings` | `UserRouter` |
| Workspace | `workspace.ts` | `Workspace` | `WorkspaceRouter` |
| Auth | — | — | `AuthRouter` |

## Adding a New Feature

### 1. Define Types & Schemas

**In `packages/types/src/[feature].ts`:**

```typescript
import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  createdAt: z.string()
});

export const CreateFeatureInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1)
});

export type Feature = z.infer<typeof FeatureSchema>;
export type CreateFeatureInput = z.infer<typeof CreateFeatureInputSchema>;
```

Export from `packages/types/src/index.ts`.

### 2. Create Database Schema

**In `packages/server/src/db/schema.ts`:**

```typescript
export const features = pgTable("features", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
```

### 3. Create Service

**In `packages/server/src/modules/[feature]/[feature].service.ts`:**

```typescript
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { features } from "../../db/schema";

export const toFeatureOutput = (row: typeof features.$inferSelect) => ({
  id: row.id,
  workspaceId: row.workspaceId,
  name: row.name,
  createdAt: row.createdAt.toISOString()
});

export class FeatureService {
  async list(workspaceId: string) {
    return db.select().from(features).where(eq(features.workspaceId, workspaceId));
  }
}

export const featureService = new FeatureService();
```

### 4. Create Router

**In `packages/server/src/modules/[feature]/[feature].router.ts`:**

```typescript
import { z } from "zod";
import { FeatureSchema, CreateFeatureInputSchema } from "@acme/types";
import { Router, Query, Mutation, Ctx, UseMiddlewares } from "../../trpc/decorators";
import { requireUser } from "../../trpc/middlewares";
import type { Context } from "../../trpc/context";
import { featureService, toFeatureOutput } from "./feature.service";

@Router({ alias: "feature" })
export class FeatureRouter {
  @Query({ input: z.object({ workspaceId: z.string() }), output: z.array(FeatureSchema) })
  @UseMiddlewares(requireUser)
  async list(input: { workspaceId: string }) {
    const rows = await featureService.list(input.workspaceId);
    return rows.map(toFeatureOutput);
  }
}
```

### 5. Create Module Index

**In `packages/server/src/modules/[feature]/index.ts`:**

```typescript
export * from "./feature.service";
export * from "./feature.router";
```

### 6. Register Module

**In `packages/server/src/modules/index.ts`:**

```typescript
import "./auth";
import "./user";
import "./workspace";
import "./feature"; // Add this line — side-effect registers the @Router class
```

### 7. Update Generated Types

**In `packages/server/src/trpc/@generated/app-router.ts`**, add the new router to the type:

```typescript
import type { FeatureRouter } from "../../../modules/feature/feature.router";
// Add FeatureRouter to the AppRouter type definition
```

### 8. Use in Frontend

```typescript
import { trpc } from "@/lib/trpc";

function FeatureList({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = trpc.feature.list.useQuery({ workspaceId });
  if (isLoading) return <div>Loading...</div>;
  return <ul>{data?.map(f => <li key={f.id}>{f.name}</li>)}</ul>;
}
```

### Checklist

Before committing a new feature:

- ✅ Types and schemas defined in `packages/types`
- ✅ Exported from `packages/types/src/index.ts`
- ✅ Database schema added to `packages/server/src/db/schema.ts`
- ✅ Service class + `toXxxOutput()` helper created
- ✅ tRPC router class created with `@Router` decorator
- ✅ Module `index.ts` exports service and router
- ✅ Module imported (side-effect) in `packages/server/src/modules/index.ts`
- ✅ `@generated/app-router.ts` updated with new router type
- ✅ Input/output schemas defined for all procedures
- ✅ `@UseMiddlewares(requireUser)` on protected routes
- ✅ Frontend components use tRPC hooks
- ✅ Run `pnpm db:migrate` after schema changes
- ✅ **Lint passes**: `make lint` — no errors introduced by this change
- ✅ **TypeScript passes**: `make tsc` — no errors introduced by this change
- ✅ **Full check**: `make lint && make tsc` — must be clean before every commit (pre-existing errors unrelated to this change can be ignored)
