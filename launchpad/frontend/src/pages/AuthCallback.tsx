import { redirectToLogin } from "@/lib/api-client"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"

export function AuthCallback() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const refreshToken = params.get("refresh_token")
    const user = params.get("user")

    if (token && refreshToken && user) {
      localStorage.setItem("access_token", token)
      localStorage.setItem("refresh_token", refreshToken)
      localStorage.setItem("user", user)
      void navigate("/launchpad")
    } else {
      redirectToLogin()
    }
  }, [navigate])

  return <div>Processing authentication...</div>
}
