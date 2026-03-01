import { authZh } from "./auth/zh.js";
import { commonZh } from "./common/zh.js";
import { userZh } from "./user/zh.js";
import { workspaceZh } from "./workspace/zh.js";

export const zh = {
  translation: {
    errors: {
      common: commonZh.errors,
      auth: authZh.errors,
      user: userZh.errors,
      workspace: workspaceZh.errors,
    },
  },
};

export type TranslationSchema = typeof zh;
