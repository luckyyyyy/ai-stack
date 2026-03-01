import type { AuthSchema } from "./zh.js";

export const authEn: AuthSchema = {
  errors: {
    invalidCredentials: "Invalid email or password",
    defaultWorkspaceNotFound: "Default workspace not found",
    emailAlreadyRegistered: "Email already registered",
  },
};
