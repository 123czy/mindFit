import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import { parseBackendResponse } from "@/lib/server/response-helpers";

interface RouteParams {
  params: { id: string };
}

async function handleBackendResponse(response: Response) {
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

function buildHeaders(request: NextRequest, accessToken?: string) {
  const cookieHeader = request.headers.get("cookie");
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (cookieHeader) {
    headers["cookie"] = cookieHeader;
  }
  return headers;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const response = await backendFetch(`/posts/${params.id}`, {
    method: "GET",
    headers: buildHeaders(_request, accessToken || undefined),
  });
  return handleBackendResponse(response);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const body = await request.text();
  const headers = {
    "Content-Type": request.headers.get("content-type") || "application/json",
    ...buildHeaders(request, accessToken || undefined),
  };

  const response = await backendFetch(`/posts/${params.id}`, {
    method: "PUT",
    headers,
    body,
  });
  return handleBackendResponse(response);
}
