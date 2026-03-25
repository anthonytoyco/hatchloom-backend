import { redirectToLogin } from "../api/auth";

function Protected({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    redirectToLogin();
    return null;
  }

  return <>{children}</>;
}

export default Protected;
