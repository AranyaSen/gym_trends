import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { refreshTokenService } from "./auth/auth.services";

const baseURL = import.meta.env.VITE_API_URL?.trim() || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const refreshClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().userDetails?.access_token;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err && err.status === 401) {
      const res = await refreshTokenService();
      const accessToken = res.data.access_token;
      const setAccessToken = useAuthStore.getState().setAccessToken;
      setAccessToken(accessToken);
      return apiClient(originalRequest);
    }
  },
);
