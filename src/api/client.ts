import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AdminUser } from '../types/api';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .then((r) => r.data as any)
      .then((data) => {
        const nextAccess = data.accessToken as string;
        const nextRefresh = data.refreshToken as string;
        const user = data.user as AdminUser;
        useAuthStore.getState().setSession({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          admin: user,
        });
        return nextAccess;
      })
      .catch(() => {
        useAuthStore.getState().clear();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (!original) throw error;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const nextAccess = await refreshAccessToken();
      if (nextAccess) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${nextAccess}`;
        return api.request(original);
      }
    }

    throw error;
  },
);

