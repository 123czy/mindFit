import { NextResponse } from "next/server";

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export function forwardSetCookieHeaders(
  backendHeaders: Headers,
  response: NextResponse
) {
  const headerWithMethod = backendHeaders as HeadersWithGetSetCookie;
  if (typeof headerWithMethod.getSetCookie === "function") {
    const cookies = headerWithMethod.getSetCookie();
    cookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
    return;
  }

  const raw = backendHeaders.get("set-cookie");
  if (raw) {
    response.headers.append("Set-Cookie", raw);
  }
}

export async function parseBackendResponse(
  backendResponse: Response
): Promise<{ data: any; isJson: boolean }> {
  const contentType = backendResponse.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const data = await backendResponse.json();
      console.log("parseBackendResponse data---", data);
      return { data, isJson: true };
    } catch {
      return { data: null, isJson: true };
    }
  }

  const text = await backendResponse.text().catch(() => "");
  return { data: text, isJson: false };
}
