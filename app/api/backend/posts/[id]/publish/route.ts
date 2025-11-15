import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import { parseBackendResponse } from "@/lib/server/response-helpers";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch(`/posts/${params.id}/publish`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

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
