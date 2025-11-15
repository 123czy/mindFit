import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend-client";
import {
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from "@/lib/server/auth-cookies";
import {
  forwardSetCookieHeaders,
  parseBackendResponse,
} from "@/lib/server/response-helpers";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  // console.log("google signin payload---", payload);
  // return;

  const backendResponse = await backendFetch("/auth/google/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
    "access_token" in data &&
    typeof data.access_token === "string"
  ) {
    setAccessTokenCookie(nextResponse, data.access_token);
  } else if (!backendResponse.ok) {
    clearAccessTokenCookie(nextResponse);
  }

  return nextResponse;
}
