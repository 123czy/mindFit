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
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch(`/prompts/${id}`, {
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

  return nextResponse;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.text();
  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch(`/products/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
  });

  const { data, isJson } = await parseBackendResponse(backendResponse);
  const nextResponse = isJson
    ? NextResponse.json(data, { status: backendResponse.status })
    : new NextResponse(data, { status: backendResponse.status });

  forwardSetCookieHeaders(backendResponse.headers, nextResponse);
  return nextResponse;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const accessToken = await getAccessTokenFromRequest();
  if (!accessToken)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.text();
  const cookieHeader = request.headers.get("cookie");

  const backendResponse = await backendFetch(`/products/${params.id}`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
  });

  const { data, isJson } = await parseBackendResponse(backendResponse);
  const nextResponse = isJson
    ? NextResponse.json(data, { status: backendResponse.status })
    : new NextResponse(data, { status: backendResponse.status });

  forwardSetCookieHeaders(backendResponse.headers, nextResponse);
  return nextResponse;
}
