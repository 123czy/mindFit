/**
 * API 客户端配置
 * 用于对接 Go 后端 HTTP 接口
 * 根据 doc.json，basePath 为 /api/v1
 */

import { ENV_CONFIG } from "@/lib/constants";

// 优先使用环境变量，其次使用 ENV_CONFIG 中的配置
const getApiBaseUrl = (): string => {
  // 1. 优先使用环境变量
  // if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  //   return process.env.NEXT_PUBLIC_API_BASE_URL;
  // }

  // 2. 客户端：使用代理路由（解决跨域问题）
  if (typeof window !== "undefined") {
    // 浏览器环境，使用 Next.js 代理路由
    return "/api/proxy";
  }

  // 3. 服务端：直接请求后端（SSR 时不需要代理）
  if (ENV_CONFIG.API_BASE_URL) {
    return ENV_CONFIG.API_BASE_URL;
  }

  // 4. 根据环境选择默认地址
  if (ENV_CONFIG.IS_DEV) {
    return `${ENV_CONFIG.DEV_API_URL}/api/v1`;
  }

  if (ENV_CONFIG.IS_PROD) {
    return `${ENV_CONFIG.PROD_API_URL}/api/v1`;
  }

  // 5. 最后的默认值
  return "http://localhost:8080/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

// 开发环境下打印 API 基础 URL（用于调试）
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("[API Client] API Base URL:", API_BASE_URL);
}

// 默认请求超时时间（毫秒）
const DEFAULT_TIMEOUT = 8000; // 8秒

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

/**
 * 创建自定义错误
 */
class ApiClientError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * 获取认证 token
 * 现在由服务器端 HttpOnly Cookie 管理，客户端不再持久化
 */
function getAuthToken(): string | null {
  return null;
}

/**
 * 设置认证 token
 */
export function setAuthToken(_token: string): void {
  // no-op: access tokens are stored in HttpOnly cookies server-side
}

/**
 * 清除认证 token
 */
export function clearAuthToken(): void {
  // no-op: access tokens are stored in HttpOnly cookies server-side
}

/**
 * 刷新 token（使用 refresh token cookie）
 * 根据 doc.json，refresh token 通过 cookie 自动发送
 */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    // 创建 AbortController 用于超时控制
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, DEFAULT_TIMEOUT);

    try {
      // 刷新 token 使用 cookie，不需要 Authorization header
      const refreshUrl = buildUrl("/auth/refresh");
      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include", // 重要：包含 cookie
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        clearAuthToken();
        return null;
      }

      const data = await response.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
        return data.access_token;
      }

      return null;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        console.error("Token refresh timeout");
      } else {
        console.error("Failed to refresh token:", error);
      }

      clearAuthToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * 构建请求配置
 */
interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  timeout?: number; // 请求超时时间（毫秒），默认 30 秒
}

/**
 * 构建完整的 URL
 * 支持相对路径（如 /api/proxy）和绝对路径（如 http://example.com/api/v1）
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // 如果 API_BASE_URL 是相对路径（以 / 开头），直接拼接
  if (API_BASE_URL.startsWith("/")) {
    // 相对路径：直接拼接
    let url = `${API_BASE_URL}${endpoint}`;

    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  } else {
    // 绝对路径：使用 URL 对象
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }
}

/**
 * 处理响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorCode: string | undefined;

    try {
      if (contentType?.includes("application/json")) {
        const errorData: ApiResponse = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code?.toString();
      }
    } catch {
      // 如果无法解析错误响应，使用默认错误消息
    }

    // 401 未授权，清除 token
    if (response.status === 401) {
      clearAuthToken();
    }

    throw new ApiClientError(errorMessage, response.status, errorCode);
  }

  // 处理空响应
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }

  // 解析 JSON 响应
  if (contentType?.includes("application/json")) {
    const data: ApiResponse<T> = await response.json();

    // 如果后端返回的是标准格式 { code, message, data }
    if (data.code !== undefined) {
      if (data.code !== 0 && data.code !== 200) {
        throw new ApiClientError(
          data.message || "请求失败",
          response.status,
          data.code?.toString()
        );
      }
      return data.data as T;
    }

    // 如果没有标准格式，直接返回数据
    return data as unknown as T;
  }

  // 处理文本响应
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * API 客户端类
 */
class ApiClient {
  /**
   * 通用请求方法
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      params,
      skipAuth = false,
      timeout = DEFAULT_TIMEOUT,
      ...fetchConfig
    } = config;

    const url = buildUrl(endpoint, params);
    const headers = new Headers(fetchConfig.headers);

    // 设置 Content-Type
    if (!headers.has("Content-Type") && fetchConfig.body) {
      headers.set("Content-Type", "application/json");
    }

    // 添加认证 token
    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    // 创建 AbortController 用于超时控制
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    // 确保包含 credentials（cookie）用于 refresh token
    const fetchOptions: RequestInit = {
      ...fetchConfig,
      headers,
      credentials: "include",
      signal: abortController.signal,
    };

    try {
      let response = await fetch(url, fetchOptions);

      // 清除超时定时器（请求成功）
      clearTimeout(timeoutId);

      // 如果返回 401 且不是刷新 token 的请求，尝试刷新 token
      if (
        response.status === 401 &&
        !skipAuth &&
        !url.includes("/auth/refresh")
      ) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // 创建新的 AbortController 用于重试请求
          const retryAbortController = new AbortController();
          const retryTimeoutId = setTimeout(() => {
            retryAbortController.abort();
          }, timeout);

          try {
            // 使用新 token 重试请求
            headers.set("Authorization", `Bearer ${newToken}`);
            response = await fetch(url, {
              ...fetchOptions,
              headers,
              signal: retryAbortController.signal,
            });
            clearTimeout(retryTimeoutId);
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            if (
              retryError instanceof Error &&
              retryError.name === "AbortError"
            ) {
              throw new ApiClientError(
                `请求超时（${timeout}ms）`,
                408,
                "TIMEOUT"
              );
            }
            throw retryError;
          }
        }
      }

      return handleResponse<T>(response);
    } catch (error) {
      // 清除超时定时器（请求失败）
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      // 处理超时错误
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError(`请求超时（${timeout}ms）`, 408, "TIMEOUT");
      }

      // 网络错误
      throw new ApiClientError(
        error instanceof Error ? error.message : "网络请求失败",
        0,
        "NETWORK_ERROR"
      );
    }
  }

  /**
   * GET 请求
   */
  get<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST 请求
   */
  post<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  put<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 请求
   */
  patch<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// 导出单例
export const apiClient = new ApiClient();

// 导出错误类型
export { ApiClientError };
