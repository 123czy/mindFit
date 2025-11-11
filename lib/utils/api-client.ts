interface ApiError {
  error?: string
  message?: string
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiError
    return payload.error || payload.message || response.statusText
  } catch {
    return response.statusText
  }
}

export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    ...init,
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as T
}

export async function apiPost<T>(
  url: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return (await response.json()) as T
}
