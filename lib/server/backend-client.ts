import { ENV_CONFIG } from "@/lib/constants";

/**
 * 解析后端 API 基础 URL
 *
 * 优先级顺序：
 * 1. GO_API_BASE_URL - 服务端专用环境变量（本地开发时应设置为 http://localhost:8080/api/v1）
 * 2. API_BASE_URL - 备用环境变量
 * 3. NEXT_PUBLIC_API_BASE_URL - 公共环境变量
 * 4. ENV_CONFIG.API_BASE_URL - 从配置文件读取
 * 5. 开发/生产环境默认值
 * 6. localhost:8080 - 最终回退
 *
 * 注意：
 * - 本地开发时，Next.js 在本地运行，应使用 localhost:8080 访问 Docker 中的后端
 * - Docker Compose 中，前端服务使用 backend:8080 访问后端服务
 */
function resolveBackendBaseUrl(): string {
  // 优先使用 GO_API_BASE_URL（服务端专用）
  if (process.env.GO_API_BASE_URL) {
    return process.env.GO_API_BASE_URL;
  }

  // 备用：API_BASE_URL
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // 使用 NEXT_PUBLIC_API_BASE_URL
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 从配置文件读取
  if (ENV_CONFIG.API_BASE_URL) {
    return ENV_CONFIG.API_BASE_URL;
  }

  // 开发环境默认值
  if (ENV_CONFIG.IS_DEV) {
    return `${ENV_CONFIG.DEV_API_URL}/api/v1`;
  }

  // 生产环境默认值
  if (ENV_CONFIG.IS_PROD) {
    return `${ENV_CONFIG.PROD_API_URL}/api/v1`;
  }

  // 最终回退：本地开发默认值
  return "http://localhost:8080/api/v1";
}

const BACKEND_BASE_URL = resolveBackendBaseUrl().replace(/\/$/, "");

export function buildBackendUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (!path.startsWith("/")) {
    return `${BACKEND_BASE_URL}/${path}`;
  }

  return `${BACKEND_BASE_URL}${path}`;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = buildBackendUrl(path);
  console.log("backendFetchurl---", url);
  return fetch(url, {
    cache: "no-store",
    ...init,
  });
}
