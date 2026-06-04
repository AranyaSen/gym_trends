import axios from "axios";
import { STORAGE_TOKEN_KEY } from "../constants/routes";

const baseURL = import.meta.env.VITE_API_URL?.trim() || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    return Promise.reject(err);
  },
);
