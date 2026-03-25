import { storeSession } from "@/lib/api-client"
import { useState } from "react"
import { useNavigate } from "react-router"

const AUTH_BASE = "/api/auth"

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

async function authGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const login = await authPost<{ accessToken?: string; refreshToken?: string; username?: string; message?: string }>(
        "/login",
        { username, password }
      )
      if (!login.accessToken) {
        setError(login.message ?? "Login failed. Check your credentials.")
        return
      }

      const session = await authGet<{ valid?: boolean; userId?: string; role?: string }>(
        "/validate",
        login.accessToken
      )
      if (!session.valid || !session.userId) {
        setError("Could not resolve session. Try again.")
        return
      }

      storeSession(login.accessToken, {
        userId: session.userId,
        username: login.username ?? username,
        role: session.role ?? "",
      })

      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hatch-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-black text-hatch-charcoal">
            Welcome to <span className="text-hatch-orange">Launchpad</span> 🚀
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your HatchLoom account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-hatch-charcoal">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition focus:border-hatch-orange focus:ring-2 focus:ring-orange-100 disabled:bg-hatch-bg"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-hatch-charcoal">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none transition focus:border-hatch-orange focus:ring-2 focus:ring-orange-100 disabled:bg-hatch-bg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-hatch-orange px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="http://localhost:3000"
            className="font-semibold text-hatch-pink hover:underline"
          >
            Register at HatchLoom Auth
          </a>
        </p>
      </div>
    </div>
  )
}
