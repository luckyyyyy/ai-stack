export const errorsZh = {
  common: {
    unauthorized: "未登录",
    forbidden: "无权限访问",
    requestFailed: "请求失败",
    missingWorkspace: "缺少工作空间参数",
    workspaceForbidden: "无权限访问该工作空间",
  },
  auth: {
    invalidCredentials: "账号或密码错误",
    defaultWorkspaceNotFound: "未找到默认工作空间",
    emailAlreadyRegistered: "邮箱已注册",
  },
  user: {
    notFound: "用户不存在",
    emailInUse: "邮箱已被使用",
  },
  workspace: {
    notFound: "工作空间不存在",
    onlyOwnerCanUpdate: "仅创建者可修改",
    onlyOwnerCanDelete: "仅创建者可删除",
    slugExists: "Slug 已存在",
  },
};

export type ErrorsSchema = typeof errorsZh;
