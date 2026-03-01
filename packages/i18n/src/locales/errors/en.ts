import type { ErrorsSchema } from "./zh.js";

export const errorsEn: ErrorsSchema = {
  common: {
    unauthorized: "Not logged in",
    forbidden: "No permission to access",
    requestFailed: "Request failed",
    missingWorkspace: "Missing workspace parameter",
    workspaceForbidden: "No permission to access this workspace",
  },
  auth: {
    invalidCredentials: "Invalid email or password",
    defaultWorkspaceNotFound: "Default workspace not found",
    emailAlreadyRegistered: "Email already registered",
  },
  user: {
    notFound: "User not found",
    emailInUse: "Email already in use",
  },
  workspace: {
    notFound: "Workspace not found",
    onlyOwnerCanUpdate: "Only the owner can update",
    onlyOwnerCanDelete: "Only the owner can delete",
    slugExists: "Slug already exists",
  },
};
