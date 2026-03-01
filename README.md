# ai-stack

> Production-ready full-stack scaffold for building AI-powered applications.
> Monorepo · Hono · tRPC · React 19 · Drizzle ORM · TypeScript

---

## Why ai-stack?

Building AI products requires moving fast without sacrificing type-safety or scalability.
**ai-stack** gives you a battle-tested monorepo foundation so you can focus on the AI logic — not the boilerplate.

- **End-to-end type-safety** via tRPC + Zod v4 — from DB schema to UI props
- **AI-ready backend** — drop in OpenAI / Anthropic / local LLM SDKs alongside Hono's streaming support
- **Streaming support** — Hono's `streamText` / SSE for real-time LLM output to the frontend
- **Auth baked in** — session-based auth with middleware, easy to extend to OAuth / API keys
- **File uploads** — S3-compatible storage (works with AWS S3, Cloudflare R2, MinIO)
- **i18n** — zh / en out of the box, easily extensible
- **One command setup** — `make init` gets you from zero to running in minutes

---

## Tech Stack

### Backend `packages/server`

| Layer | Tech |
|---|---|
| HTTP Framework | [Hono](https://hono.dev/) + `@hono/node-server` |
| API Layer | [tRPC v11](https://trpc.io/) with custom class-based decorator system |
| Database | PostgreSQL 16 |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) 0.45 |
| Validation | [Zod v4](https://zod.dev/) |
| Runtime | Node.js + TypeScript (`tsx watch`) |
| Storage | S3-compatible (AWS S3 / Cloudflare R2 / MinIO) |
| Logging | Built-in `Logger` class — NestJS-style colored output |

### Frontend `packages/web`

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | TailwindCSS 4 (no UI library, fully custom) |
| State | TanStack Query v5 |
| Routing | React Router DOM v7 |
| API Client | tRPC Client (auto-typed from server) |
| i18n | i18next + react-i18next |

### Shared Packages

| Package | Purpose |
|---|---|
| `@acme/types` | TypeScript types + Zod schemas (shared between server and client) |
| `@acme/components` | Generic UI components (no business logic) |
| `@acme/i18n` | i18n resources (zh / en) |

### Toolchain

| Tool | Purpose |
|---|---|
| pnpm 10 | Package manager (workspace protocol) |
| Biome | Linting + formatting (replaces Prettier + ESLint) |
| Docker Compose | Local PostgreSQL 16 container |
| Concurrently | Run multiple dev servers in parallel |

---

## Project Structure

```
packages/
  server/          # Hono + tRPC + Drizzle backend
    src/
      db/          # Drizzle schema + DB client
      modules/     # Feature modules (auth, user, workspace, ...)
      trpc/        # tRPC core, context, middlewares, decorators
      storage/     # S3-compatible file storage
      main.ts      # Hono bootstrap

  web/             # React + Vite frontend
    src/
      components/  # Business components (use tRPC hooks)
      pages/       # Route-level pages
      hooks/       # Shared React hooks
      lib/         # tRPC client, i18n, storage helpers

  types/           # Shared Zod schemas & TypeScript types
  components/      # Generic reusable UI components
  i18n/            # Translation resources (zh / en)
```

---

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 10 (`corepack enable`)
- Docker & Docker Compose

### Initialize

```bash
make init
```

`make init` runs:
1. Copies `.env.example` → `.env` for each package
2. Removes existing DB containers and volumes
3. `pnpm install`
4. Starts PostgreSQL container and waits for readiness
5. Runs database migrations (`drizzle-kit push`)

> ⚠️ `make init` will **drop** the existing database. Use with care in non-local environments.

### Development

```bash
make dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| tRPC Endpoint | http://localhost:4000/trpc |
| Database | localhost:5432 |

---

## Adding AI Features

The scaffold is intentionally unopinionated about which AI SDK you use.
Here's the recommended pattern for adding LLM capabilities:

```bash
pnpm --filter @acme/server add openai   # or @anthropic-ai/sdk, ollama, etc.
```

Use Hono's streaming response for real-time output:

```typescript
// packages/server/src/modules/ai/ai.router.ts
import { streamText } from "hono/streaming";
import OpenAI from "openai";

// Add a streaming SSE route via Hono directly (outside tRPC)
app.post("/ai/stream", requireAuth, async (c) => {
  const { prompt } = await c.req.json();
  const client = new OpenAI();
  return streamText(c, async (stream) => {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });
    for await (const chunk of response) {
      await stream.write(chunk.choices[0]?.delta?.content ?? "");
    }
  });
});
```

For non-streaming AI queries (classification, embeddings, structured output), use tRPC mutations as normal procedures.

---

## Architecture Patterns

### tRPC Router (decorated class)

```typescript
@Router({ alias: "feature" })
export class FeatureRouter {
  @Query({ input: InputSchema, output: OutputSchema })
  @UseMiddlewares(requireUser)
  async list(@Ctx() ctx: Context, input: Input) {
    return featureService.list(ctx.userId!);
  }
}
```

### Data Layer Separation

| Layer | Type | Location |
|---|---|---|
| Database | Drizzle Schema | `packages/server/src/db/schema.ts` |
| Shared Types | TypeScript + Zod | `packages/types/src/*.ts` |
| Business Logic | Service classes | `modules/[feature]/[feature].service.ts` |
| API | tRPC Routers | `modules/[feature]/[feature].router.ts` |

---

## Development Commands

```bash
make init          # First-time setup (resets DB)
make dev           # Start all services (DB + server + web)

pnpm check         # Lint + TypeScript check (run before every commit)
pnpm lint          # Biome lint
pnpm typecheck     # tsc --noEmit across all packages
pnpm format        # Auto-fix formatting

pnpm db:up         # Start PostgreSQL container
pnpm db:down       # Stop PostgreSQL container
pnpm db:migrate    # Run Drizzle migrations
```

---

## License

MIT
