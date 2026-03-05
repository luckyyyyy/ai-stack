# 构建阶段
FROM node:20-alpine AS builder

# 启用 corepack 以使用 pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# 复制 workspace 配置文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.base.json ./

# 复制 types 包配置和源代码（server 依赖 types）
COPY packages/types/package.json ./packages/types/
COPY packages/types/tsconfig.json ./packages/types/
COPY packages/types/src ./packages/types/src

# 复制 i18n 包配置和源代码（server 依赖 i18n）
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/i18n/tsconfig.json ./packages/i18n/
COPY packages/i18n/src ./packages/i18n/src

# 复制 server 包配置
COPY packages/server/package.json ./packages/server/
COPY packages/server/tsconfig.json ./packages/server/
COPY packages/server/tsconfig.build.json ./packages/server/

# 复制 Prisma schema（prisma generate 在安装时需要它）
COPY packages/server/prisma ./packages/server/prisma

# 安装所有依赖（包括 devDependencies，构建时需要）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 生成 Prisma Client
RUN pnpm --filter @acme/server db:generate

# 复制源代码
COPY packages/server/src ./packages/server/src

# 构建应用
WORKDIR /app/packages/server
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

# 启用 corepack
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# 复制必要的配置文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/server/package.json ./packages/server/
COPY packages/server/prisma ./packages/server/prisma

# 从构建阶段复制构建产物（在安装依赖前，避免 prepare 脚本运行）
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/i18n/dist ./packages/i18n/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 生成 Prisma Client（生产环境）
RUN pnpm --filter @acme/server db:generate

# 设置工作目录
WORKDIR /app/packages/server

# 暴露端口
EXPOSE 4000

# 启动应用
CMD ["node", "dist/main.js"]

# ─── 迁移阶段（一次性容器，用于生产数据库迁移）───────────────────────────────
FROM builder AS migrate
WORKDIR /app/packages/server
# DATABASE_URL 在 docker-compose 中通过环境变量注入
CMD ["pnpm", "db:push"]

