export function redirectToLogin() {
  const authUrl =
    (import.meta.env.VITE_AUTH_URL as string | undefined) ??
    "http://localhost:3000";
  const callbackUrl = encodeURIComponent(
    `${window.location.origin}/auth/callback`,
  );
  window.location.href = `${authUrl}/login?redirect_uri=${callbackUrl}`;
}

export function isTokenValid(): boolean {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    const exp = payload.exp;
    if (!exp) return false;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}
