import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  const backendResponse = await backendFetch(
    `/bundles/created?status=${status}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    }
  );

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
