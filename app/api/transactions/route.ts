import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";
import { backendFetch } from "@/lib/server/backend-client";

export async function POST(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  const body = await request.json();
  const cookieHeader = request.headers.get("cookie");
  const backendResponse = await backendFetch("/transactions", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
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
