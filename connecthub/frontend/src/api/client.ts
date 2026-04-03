import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      const callbackUrl = encodeURIComponent(
        `${window.location.origin}/auth/callback`,
      );
      const authUrl =
        (import.meta.env.VITE_AUTH_URL as string | undefined) ??
        "http://localhost:3000";
      window.location.href = `${authUrl}/login?redirect_uri=${callbackUrl}`;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
