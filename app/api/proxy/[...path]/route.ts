/**
 * API 代理路由
 * 用于解决跨域问题，将前端请求转发到后端服务器
 *
 * 使用方式：
 * /api/proxy/auth/google/signin -> http://106.52.76.120:8080/api/v1/auth/google/signin
 */

import { NextRequest, NextResponse } from "next/server";
import { ENV_CONFIG } from "@/lib/constants";

// 获取后端 API 基础 URL
function getBackendUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // 使用 ENV_CONFIG 中的配置
  if (ENV_CONFIG.API_BASE_URL) {
    return ENV_CONFIG.API_BASE_URL;
  }

  // 根据环境选择
  if (ENV_CONFIG.IS_DEV) {
    return `${ENV_CONFIG.DEV_API_URL}/api/v1`;
  }

  if (ENV_CONFIG.IS_PROD) {
    return `${ENV_CONFIG.PROD_API_URL}/api/v1`;
  }

  // 默认值
  return "http://localhost:8080/api/v1";
}

// 处理所有 HTTP 方法
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, "DELETE");
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// 统一的请求处理函数
async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const backendUrl = getBackendUrl();
    const path = params.path.join("/");
    const url = `${backendUrl}/${path}`;

    // 开发环境下打印代理信息（用于调试）
    if (process.env.NODE_ENV === "development") {
      console.log("[Proxy] Forwarding request:", {
        method,
        path,
        from: `/api/proxy/${path}`,
        to: url,
      });
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    // 准备请求头
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // 转发 Authorization header（如果有）
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // 准备请求体
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        const requestBody = await request.json();
        body = JSON.stringify(requestBody);
      } catch {
        // 如果没有 body，保持 undefined
      }
    }

    // 转发请求到后端
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      // 重要：包含 credentials（cookie）用于 refresh token
      credentials: "include",
    });

    // 获取响应数据
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 创建响应
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });

    // 设置 CORS 头
    nextResponse.headers.set("Access-Control-Allow-Origin", "*");
    nextResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    nextResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // 转发 Set-Cookie header（用于 refresh token）
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("Set-Cookie", setCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      {
        error: "Proxy request failed",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
