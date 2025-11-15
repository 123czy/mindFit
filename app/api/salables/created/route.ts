import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";
import { backendFetch } from "@/lib/server/backend-client";

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest();
    const cookieHeader = request.headers.get("cookie");

    // 提取查询参数并传递给后端
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const mountedItem = searchParams.get("mounted_item");
    const postId = searchParams.get("post_id");

    // 构建后端 URL，包含查询参数
    const backendParams = new URLSearchParams();
    if (status) backendParams.set("status", status);
    if (mountedItem) backendParams.set("mounted_item", mountedItem);
    if (postId) backendParams.set("post_id", postId);

    const backendUrl = backendParams.toString()
      ? `/salables/created?${backendParams.toString()}`
      : `/salables/created`;

    console.log("[Salables Created] Request URL:", backendUrl);
    console.log("[Salables Created] Query params:", {
      status,
      mountedItem,
      postId,
    });

    const backendResponse = await backendFetch(backendUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    });

    const { data, isJson } = await parseBackendResponse(backendResponse);
    console.log("[Salables Created] Response status:", backendResponse.status);
    console.log("[Salables Created] Response data:", data);

    // 如果后端返回错误，记录详细信息
    if (!backendResponse.ok) {
      console.error("[Salables Created] Backend error:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        data,
      });
    }

    const nextResponse = isJson
      ? NextResponse.json(data, {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
        })
      : new NextResponse(data, {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
        });

    forwardSetCookieHeaders(backendResponse.headers, nextResponse);
    return nextResponse;
  } catch (error) {
    console.error("[Salables Created] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
