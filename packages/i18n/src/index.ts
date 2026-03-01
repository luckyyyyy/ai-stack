/**
 * @acme/i18n - 国际化资源包
 *
 * 导出说明：
 * - zh / en: 完整翻译资源（用于 react-i18next 注册）
 * - *Zh / *En: 各领域翻译（服务端可按需引用）
 * - *Schema: TypeScript 类型
 */

// 各领域翻译（按领域模型拆分，服务端 / 客户端可按需引用）
export { authEn } from "./locales/auth/en.js";
export type { AuthSchema } from "./locales/auth/zh.js";
export { authZh } from "./locales/auth/zh.js";
export { commonEn } from "./locales/common/en.js";
export type { CommonSchema } from "./locales/common/zh.js";
export { commonZh } from "./locales/common/zh.js";
// 完整语言包（用于 react-i18next 初始化）
export { en } from "./locales/en.js";
export { userEn } from "./locales/user/en.js";
export type { UserSchema } from "./locales/user/zh.js";
export { userZh } from "./locales/user/zh.js";
export { workspaceEn } from "./locales/workspace/en.js";
export type { WorkspaceSchema } from "./locales/workspace/zh.js";
export { workspaceZh } from "./locales/workspace/zh.js";
export type { TranslationSchema } from "./locales/zh.js";
export { zh } from "./locales/zh.js";
