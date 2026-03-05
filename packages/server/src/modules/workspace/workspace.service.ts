import type { Workspace } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/db/client";
import { getMessage, type Language } from "@/i18n";
import { slugify } from "@/utils/slugify";

export const toWorkspaceOutput = (workspace: Workspace) => ({
  id: workspace.id,
  slug: workspace.slug,
  name: workspace.name,
  description: workspace.description,
  createdAt: workspace.createdAt?.toISOString(),
});

export class WorkspaceService {
  async listByUser(userId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return members.map((m) => m.workspace);
  }

  async getBySlug(slug: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: { userId, workspace: { slug } },
      include: { workspace: true },
    });
    return member?.workspace ?? null;
  }

  async getById(id: string) {
    return prisma.workspace.findFirst({ where: { id } });
  }

  async ensureUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await prisma.workspace.findFirst({
        where: { slug },
        select: { id: true },
      });
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  async create(
    input: { name: string; slug?: string; description?: string | null },
    userId: string,
  ) {
    const baseSlug = input.slug?.trim() || slugify(input.name) || "workspace";
    const slug = await this.ensureUniqueSlug(baseSlug);

    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: input.name,
          slug,
          description: input.description ?? null,
        },
      });

      await tx.workspaceMember.create({
        data: { workspaceId: workspace.id, userId, role: "owner" },
      });

      return workspace;
    });
  }

  async update(
    id: string,
    input: { name?: string; slug?: string; description?: string | null },
    userId: string,
    language: Language,
  ) {
    const workspace = await this.getById(id);

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: getMessage(language, "errors.workspace.notFound"),
      });
    }

    const ownerMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: "owner" },
      select: { id: true },
    });

    if (!ownerMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: getMessage(language, "errors.workspace.onlyOwnerCanUpdate"),
      });
    }

    let nextSlug = input.slug?.trim();
    if (nextSlug) {
      nextSlug = slugify(nextSlug) || workspace.slug;
      const existing = await prisma.workspace.findFirst({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (existing && existing.id !== workspace.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: getMessage(language, "errors.workspace.slugExists"),
        });
      }
    }

    return prisma.workspace.update({
      where: { id },
      data: {
        name: input.name ?? workspace.name,
        slug: nextSlug ?? workspace.slug,
        description:
          input.description !== undefined
            ? input.description
            : workspace.description,
      },
    });
  }

  async delete(id: string, userId: string, language: Language) {
    const workspace = await this.getById(id);

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: getMessage(language, "errors.workspace.notFound"),
      });
    }

    const ownerMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId, role: "owner" },
      select: { id: true },
    });

    if (!ownerMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: getMessage(language, "errors.workspace.onlyOwnerCanDelete"),
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceMember.deleteMany({ where: { workspaceId: id } });
      await tx.workspace.delete({ where: { id } });
    });

    return { id };
  }
}

export const workspaceService = new WorkspaceService();
