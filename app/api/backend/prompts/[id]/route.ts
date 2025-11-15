import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { parseBackendResponse } from "@/lib/server/response-helpers";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";

interface RouteParams {
  params: { id: string };
}

function buildHeaders(request: NextRequest, accessToken?: string) {
  const cookieHeader = request.headers.get("cookie");
  return {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const response = await backendFetch(`/prompts/${params.id}`, {
    method: "GET",
    headers: buildHeaders(_request, accessToken || undefined),
  });

  const { data, isJson } = await parseBackendResponse(response);
  if (isJson) {
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return new NextResponse(data, {
    status: response.status,
    statusText: response.statusText,
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const body = await request.text();
  const headers = {
    "Content-Type": request.headers.get("content-type") || "application/json",
    ...buildHeaders(request, accessToken || undefined),
  };

  const response = await backendFetch(`/prompts/${params.id}`, {
    method: "PUT",
    headers,
    body,
  });

  const { data, isJson } = await parseBackendResponse(response);
  if (isJson) {
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return new NextResponse(data, {
    status: response.status,
    statusText: response.statusText,
  });
}
