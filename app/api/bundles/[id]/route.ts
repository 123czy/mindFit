import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");
  const backendResponse = await backendFetch(`/bundles/${id}`, {
    method: "GET",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
  const { data, isJson } = await parseBackendResponse(backendResponse);
  const nextResponse = isJson
    ? NextResponse.json(data, { status: backendResponse.status })
    : new NextResponse(data, { status: backendResponse.status });
  forwardSetCookieHeaders(backendResponse.headers, nextResponse);
  return nextResponse;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");
  const body = await request.json();
  const backendResponse = await backendFetch(`/bundles/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const { data, isJson } = await parseBackendResponse(backendResponse);
  const nextResponse = isJson
    ? NextResponse.json(data, { status: backendResponse.status })
    : new NextResponse(data, { status: backendResponse.status });

  forwardSetCookieHeaders(backendResponse.headers, nextResponse);

  return nextResponse;
}
