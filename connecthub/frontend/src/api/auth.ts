export function redirectToLogin() {
  const callbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
  window.location.href = `http://localhost:3000/login?redirect_uri=${callbackUrl}`;
}
