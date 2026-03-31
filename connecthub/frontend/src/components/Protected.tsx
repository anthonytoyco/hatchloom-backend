import { isTokenValid, redirectToLogin } from "../api/auth";

function Protected({ children }: { children: React.ReactNode }) {
  if (!isTokenValid()) {
    redirectToLogin();
    return null;
  }

  return <>{children}</>;
}

export default Protected;
