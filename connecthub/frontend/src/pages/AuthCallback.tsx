import { useEffect, useRef } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";

function AuthCallback() {
  const navigate: NavigateFunction = useNavigate();
  const handled = useRef<boolean>(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refresh_token");
    const user = params.get("user");

    if (token && refreshToken && user) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", user);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Processing authentication...</div>;
}

export default AuthCallback;
