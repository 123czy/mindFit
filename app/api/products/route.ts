import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";
import { backendFetch } from "@/lib/server/backend-client";

export async function POST(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  const body = await request.text();
  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch("/prompts", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body, // 直接传递 body，因为 request.text() 已经返回了 JSON 字符串
  });

  const { data, isJson } = await parseBackendResponse(backendResponse);
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
}
