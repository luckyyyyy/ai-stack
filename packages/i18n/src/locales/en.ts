import { authEn } from "./auth/en.js";
import { commonEn } from "./common/en.js";
import { userEn } from "./user/en.js";
import { workspaceEn } from "./workspace/en.js";
import type { TranslationSchema } from "./zh.js";

export const en: TranslationSchema = {
  translation: {
    errors: {
      common: commonEn.errors,
      auth: authEn.errors,
      user: userEn.errors,
      workspace: workspaceEn.errors,
    },
  },
};
