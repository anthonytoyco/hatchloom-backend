export function redirectToLogin() {
  const callbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
  window.location.href = `http://localhost:3000/login?redirect_uri=${callbackUrl}`;
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
