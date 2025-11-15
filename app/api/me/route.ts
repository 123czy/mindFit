import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import { getAccessTokenFromRequest } from "@/lib/server/auth-cookies";
import { parseBackendResponse } from "@/lib/server/response-helpers";

function unauthorizedResponse() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return unauthorizedResponse();
  }

  const cookieHeader = request.headers.get("cookie");
  const backendResponse = await backendFetch("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

export async function PUT(request: NextRequest) {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch("/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
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
