/**
 * API 模块统一导出
 * 提供所有后端 API 函数的统一入口
 */

// 导出 API 客户端
export {
  apiClient,
  setAuthToken,
  clearAuthToken,
  refreshAccessToken,
} from "./client";
export type { ApiError, ApiClientError } from "./client";

// 导出类型定义
export * from "./types";

// 导出各个模块的 API 函数
export * from "./auth";
export * from "./users";
export * from "./posts";
export * from "./prompts";
export * from "./salables";
export * from "./transactions";
