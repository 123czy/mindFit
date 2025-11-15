import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";
import { backendFetch } from "@/lib/server/backend-client";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");
  const backendResponse = await backendFetch(`/salables/${id}/publish`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
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
