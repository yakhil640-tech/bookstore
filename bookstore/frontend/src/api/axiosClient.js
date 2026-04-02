import axios from "axios";
import { clearSession, loadToken } from "../utils/storage";

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return "";
  }

  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
  const pointsToLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBaseUrl);

  if (!isLocalHost && pointsToLocalBackend) {
    return "";
  }

  return configuredBaseUrl;
}

const axiosClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
});

axiosClient.interceptors.request.use((config) => {
  const token = loadToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
