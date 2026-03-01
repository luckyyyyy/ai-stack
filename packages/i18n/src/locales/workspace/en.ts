import type { WorkspaceSchema } from "./zh.js";

export const workspaceEn: WorkspaceSchema = {
  errors: {
    notFound: "Workspace not found",
    onlyOwnerCanUpdate: "Only the owner can update",
    onlyOwnerCanDelete: "Only the owner can delete",
    slugExists: "Slug already exists",
  },
};
