/**
 * @acme/i18n - 国际化资源包
 *
 * 导出说明：
 * - zh / en: 完整翻译资源（用于 react-i18next 注册）
 * - errorsZh / errorsEn: 仅错误域（服务端可按需使用）
 * - TranslationSchema / ErrorsSchema: TypeScript 类型
 */

// 完整语言包（服务端 & 客户端共用）
export { en } from "./locales/en.js";
// 错误域（按领域拆分，服务端可直接引用）
export { errorsEn } from "./locales/errors/en.js";
export type { ErrorsSchema } from "./locales/errors/zh.js";
export { errorsZh } from "./locales/errors/zh.js";
export type { TranslationSchema } from "./locales/zh.js";
export { zh } from "./locales/zh.js";
