---
applyTo: "**"
---

# Coding Guidelines

## General TypeScript Rules

- Always prefer **async/await** over `.then()`
- Use **arrow functions** for consistency
- Avoid `any`; prefer `unknown` with proper type narrowing
- **Zod v4** schemas are mandatory for all runtime validation and API contracts
- **Import order**: Node built-ins → external packages → internal modules → relative imports

## Type & Schema Pattern

**All shared types and schemas live in `packages/types`:**

```typescript
// packages/types/src/user.ts
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  settings: UserSettingsSchema.nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;
```

**Key principles:**
1. Zod schemas are the single source of truth — types are inferred via `z.infer<>`
2. Runtime + compile-time safety
3. Shared between server and client for end-to-end type safety

## React Guidelines

- Use **functional components + hooks only** (no class components)
- Type props with `interface Props {}`
- Prefer explicit function typing: `function Component(props: Props) {}`
- Keep components small and focused (max ~150 lines)
- Use TanStack Query for all tRPC calls
- Prefer controlled components over uncontrolled
- **No antd** — use plain HTML elements + TailwindCSS classes

## Naming Conventions

| Entity | Schema File | Type Export | Router |
|--------|-------------|-------------|--------|
| User | `user.ts` | `User`, `UserSettings` | `userRouter` |
| Workspace | `workspace.ts` | `Workspace` | `workspaceRouter` |
| Auth | — | — | `authRouter` |

## File Size Guidelines

**Single files should not exceed 500 lines.** Split when needed:

```
BigComponent/
  index.tsx          # main component
  SubComponentA.tsx  # sub-component
  useBigComponent.ts # custom hook
  types.ts           # type definitions
```

## tRPC Best Practices

- **Input validation**: All procedures must define `input:` with Zod schema
- **Output validation**: Define `output:` schema for all queries/mutations
- **Protected routes**: Use `protectedProcedure` for authenticated endpoints
- **Error handling**: Throw `TRPCError` with appropriate error codes
- Never expose database model types through API boundaries — always use `toXxxOutput()` helpers

## Naming Conventions (tRPC)

```typescript
// ✅ Correct: use protectedProcedure from @/trpc/init
import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

export const myRouter = router({
  getItem: protectedProcedure.input(...).output(...).query(...),
  createItem: protectedProcedure.input(...).output(...).mutation(...),
});
```
