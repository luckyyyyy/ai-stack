---
applyTo: "packages/server/**"
---

# Database & ORM (Prisma)

## Overview

- **ORM**: Prisma v6 with PostgreSQL 16
- **Schema file**: `packages/server/prisma/schema.prisma` — single source of truth for all tables
- **Client**: `packages/server/src/db/client.ts` — global `prisma` singleton

## Prisma Client Usage

```typescript
// Import the global singleton
import { prisma } from "@/db/client";

// Query examples
const user = await prisma.user.findFirst({ where: { email } });
const users = await prisma.user.findMany({ where: { role: "admin" } });
const created = await prisma.user.create({ data: { name, email, passwordHash, role: "user" } });
const updated = await prisma.user.update({ where: { id }, data: { name } });
await prisma.user.delete({ where: { id } });

// Transactions
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  await tx.workspaceMember.create({ data: { userId: user.id, ... } });
});
```

## Schema Pattern

```prisma
model User {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  settings     Json?
  role         String    @default("user")
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  sessions         Session[]
  workspaceMembers WorkspaceMember[]

  @@map("users")
}
```

**Key conventions:**
- Use `@map("snake_case")` to map camelCase fields to snake_case columns
- Use `@@map("table_name")` to map model names to table names
- Use `@db.Uuid` for UUID fields
- Use `@db.Timestamptz(6)` for timestamps with timezone
- Use `@default(dbgenerated("gen_random_uuid()"))` for UUID primary keys

## Service Pattern with Prisma

```typescript
// packages/server/src/modules/user/user.service.ts
import type { User } from "@prisma/client";
import type { UserSettings } from "@acme/types";
import { prisma } from "@/db/client";

export const toUserOutput = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as "admin" | "user",
  settings: (user.settings as UserSettings | null) ?? null,
});

export class UserService {
  async getById(userId: string) {
    return prisma.user.findFirst({ where: { id: userId } });
  }
}
export const userService = new UserService();
```

**Key principles:**
- Import Prisma model types from `@prisma/client` (e.g., `User`, `Workspace`)
- Use `toXxxOutput()` helpers to transform DB types to API types
- Never expose raw Prisma model objects through API boundaries

## CLI Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client from schema |
| `pnpm db:push` | Push schema to database (dev — no migration files) |
| `pnpm db:migrate` | Create & apply a new migration (generates SQL files) |

**Workflow:**
1. Edit `prisma/schema.prisma`
2. Run `pnpm db:push` (dev) or `pnpm db:migrate` (with migration history)
3. Run `pnpm db:generate` if only regenerating the client

## Context Integration

The `prisma` client is available on `ctx.prisma` in tRPC middlewares:

```typescript
// In middlewares.ts or procedures
const workspace = await ctx.prisma.workspace.findFirst({ where: { slug } });
```
