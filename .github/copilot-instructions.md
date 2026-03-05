# Project Overview

This is a TypeScript monorepo managed with pnpm workspaces.
Full-stack scaffold: Hono backend, React frontend, shared types.

## Packages

| Package | Purpose |
|---------|---------|
| `packages/server` | Hono + tRPC backend, Prisma ORM |
| `packages/web` | React 19 + Vite frontend |
| `packages/types` | Shared TypeScript types & Zod schemas |
| `packages/components` | Reusable UI component library |
| `packages/i18n` | Internationalization resources (zh/en) |

## Tech Stack

- **Backend**: Hono + @hono/node-server, tRPC v11, **Prisma ORM v6**, PostgreSQL 16, Zod v4
- **Frontend**: React 19, Vite 7, TailwindCSS 4, TanStack Query v5, React Router v7, i18next
- **Tooling**: pnpm 10.15.1, Biome (lint/format), TypeScript 5, ESM everywhere

## Development Commands

```bash
make dev          # Start database + all dev servers
make lint         # Biome check (must pass before commit)
make tsc          # TypeScript check across all packages
pnpm db:push      # Push Prisma schema to database (dev)
pnpm db:migrate   # Create & apply a Prisma migration
pnpm db:generate  # Regenerate Prisma Client
```

> **Required before every commit**: `make lint && make tsc` must be clean.
> Only fix errors **introduced by your change** — pre-existing errors can be ignored.

## Detailed Guides

More detail is available in `.github/instructions/`:

- **[architecture.instructions.md](.github/instructions/architecture.instructions.md)** — project structure, tRPC router pattern, component architecture
- **[database.instructions.md](.github/instructions/database.instructions.md)** — Prisma schema, queries, transactions, CLI commands
- **[feature-guide.instructions.md](.github/instructions/feature-guide.instructions.md)** — step-by-step guide for adding a new feature end-to-end
- **[coding-guidelines.instructions.md](.github/instructions/coding-guidelines.instructions.md)** — TypeScript, React, naming conventions, tRPC best practices

