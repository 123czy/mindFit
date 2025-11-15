import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import { parseBackendResponse } from "@/lib/server/response-helpers";

function buildBackendPath(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/posts?${query}` : "/posts";
}

async function proxyRequest(
  request: NextRequest,
  init: RequestInit
): Promise<NextResponse> {
  const backendResponse = await backendFetch(
    buildBackendPath(request.nextUrl.searchParams),
    init
  );
  const { data, isJson } = await parseBackendResponse(backendResponse);

  if (isJson) {
    return NextResponse.json(data, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });
  }

  return new NextResponse(data, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });
}

export async function GET(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");

  return proxyRequest(request, {
    method: "GET",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
}

export async function POST(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");
  const body = await request.text();

  return proxyRequest(request, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
  });
}
