import type { CommonSchema } from "./zh.js";

export const commonEn: CommonSchema = {
  errors: {
    unauthorized: "Not logged in",
    forbidden: "No permission to access",
    requestFailed: "Request failed",
    missingWorkspace: "Missing workspace parameter",
    workspaceForbidden: "No permission to access this workspace",
  },
};
