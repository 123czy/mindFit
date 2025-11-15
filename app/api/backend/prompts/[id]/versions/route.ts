import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { parseBackendResponse } from "@/lib/server/response-helpers";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const body = await request.text();
  const cookieHeader = request.headers.get("cookie");

  const response = await backendFetch(`/prompts/${params.id}/versions`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
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
