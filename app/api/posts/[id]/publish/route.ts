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

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch(`/posts/${id}/publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

  if (
    backendResponse.ok &&
    data &&
    typeof data === "object" &&
    "post" in data &&
    typeof data.post === "object"
  ) {
    return NextResponse.json(data.post, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });
  }

  return nextResponse;
}
