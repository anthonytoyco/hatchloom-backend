const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8082"

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
}

export function getAuthToken(): string | null {
  return localStorage.getItem("access_token") ?? getCookie("access_token")
}

export function getStoredUser(): { userId: string; username: string; role: string } | null {
  const raw = localStorage.getItem("user") ?? getCookie("user")
  try {
    return raw ? (JSON.parse(raw) as { userId: string; username: string; role: string }) : null
  } catch {
    return null
  }
}

export function storeSession(accessToken: string, user: { userId: string; username: string; role: string }) {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
}

export function redirectToLogin() {
  const callbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`)
  window.location.href = `http://localhost:3000/login?redirect_uri=${callbackUrl}`
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? ""
    let message = `${res.status} ${res.statusText}`

    if (contentType.includes("application/json")) {
      try {
        const body = (await res.json()) as { message?: string; error?: string }
        message = body.message ?? body.error ?? message
      } catch {
        // Keep default status-based message when response JSON is malformed.
      }
    } else {
      try {
        const text = await res.text()
        if (text.trim()) message = text.trim()
      } catch {
        // Keep default status-based message when response text cannot be read.
      }
    }

    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const text = await res.text()
    if (!text.trim()) return undefined as T
    return text as T
  }

  const text = await res.text()
  if (!text.trim()) return undefined as T
  return JSON.parse(text) as T
}
