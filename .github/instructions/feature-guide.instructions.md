---
applyTo: "**"
---

# Adding a New Feature

Follow these steps when adding a new backend feature end-to-end.

## Step 1 — Define Types & Schemas

**`packages/types/src/[feature].ts`:**

```typescript
import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const CreateFeatureInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type CreateFeatureInput = z.infer<typeof CreateFeatureInputSchema>;
```

Export from `packages/types/src/index.ts`.

## Step 2 — Add to Prisma Schema

**`packages/server/prisma/schema.prisma`:**

```prisma
model Feature {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  workspaceId String    @map("workspace_id") @db.Uuid
  name        String
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  workspace Workspace @relation(fields: [workspaceId], references: [id])

  @@map("features")
}
```

Then run: `pnpm db:push` (dev) or `pnpm db:migrate` (with migration history).

## Step 3 — Create Service

**`packages/server/src/modules/[feature]/[feature].service.ts`:**

```typescript
import type { Feature } from "@prisma/client";
import { prisma } from "@/db/client";

export const toFeatureOutput = (row: Feature) => ({
  id: row.id,
  workspaceId: row.workspaceId,
  name: row.name,
  createdAt: row.createdAt?.toISOString() ?? "",
});

export class FeatureService {
  async list(workspaceId: string) {
    return prisma.feature.findMany({ where: { workspaceId } });
  }
}

export const featureService = new FeatureService();
```

## Step 4 — Create Router

**`packages/server/src/modules/[feature]/[feature].router.ts`:**

```typescript
import { z } from "zod";
import { FeatureSchema, CreateFeatureInputSchema } from "@acme/types";
import { protectedProcedure, router } from "@/trpc/init";
import { featureService, toFeatureOutput } from "./feature.service";

export const featureRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(z.array(FeatureSchema))
    .query(async ({ input }) => {
      const rows = await featureService.list(input.workspaceId);
      return rows.map(toFeatureOutput);
    }),
});
```

## Step 5 — Module Index & Registration

**`packages/server/src/modules/[feature]/index.ts`:**
```typescript
export * from "./feature.service";
export * from "./feature.router";
```

**`packages/server/src/trpc/router.ts`** — add to `appRouter`:
```typescript
import { featureRouter } from "@/modules/feature/feature.router";

export const appRouter = router({
  // ...existing routers,
  feature: featureRouter,
});
```

## Step 6 — Use in Frontend

```typescript
import { trpc } from "@/lib/trpc";

function FeatureList({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = trpc.feature.list.useQuery({ workspaceId });
  if (isLoading) return <div>Loading...</div>;
  return <ul>{data?.map((f) => <li key={f.id}>{f.name}</li>)}</ul>;
}
```

## Pre-commit Checklist

- ✅ Types and schemas defined in `packages/types`
- ✅ Exported from `packages/types/src/index.ts`
- ✅ Prisma schema updated + `pnpm db:push` run
- ✅ Service class + `toXxxOutput()` helper created
- ✅ tRPC router with input/output schemas on all procedures
- ✅ Router registered in `packages/server/src/trpc/router.ts`
- ✅ `protectedProcedure` used for authenticated routes
- ✅ Frontend components use tRPC hooks
- ✅ **Lint passes**: `make lint`
- ✅ **TypeScript passes**: `make tsc`
