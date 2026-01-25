import axios from "axios";
import invariant from "tiny-invariant";
import { app } from "@/config";

export const client = axios.create({
  baseURL: app.apiBaseUrl,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to dynamically add token
client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(app.accessTokenStoreKey) ??
    sessionStorage.getItem(app.accessTokenStoreKey);

  if (token && !config.headers.authorization) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

let rememberMe = true;

export function setRememberMe(value: boolean) {
  rememberMe = value;
}

export function setClientAccessToken(token: string) {
  if (rememberMe) {
    localStorage.setItem(app.accessTokenStoreKey, token);
    sessionStorage.removeItem(app.accessTokenStoreKey);
  } else {
    sessionStorage.setItem(app.accessTokenStoreKey, token);
    localStorage.removeItem(app.accessTokenStoreKey);
  }
}

export function removeClientAccessToken() {
  localStorage.removeItem(app.accessTokenStoreKey);
  sessionStorage.removeItem(app.accessTokenStoreKey);
}

export function setClientRefreshToken(token: string) {
  if (rememberMe) {
    localStorage.setItem(app.refreshTokenStoreKey, token);
    sessionStorage.removeItem(app.refreshTokenStoreKey);
  } else {
    sessionStorage.setItem(app.refreshTokenStoreKey, token);
    localStorage.removeItem(app.refreshTokenStoreKey);
  }
}

export function removeClientRefreshToken() {
  localStorage.removeItem(app.refreshTokenStoreKey);
  sessionStorage.removeItem(app.refreshTokenStoreKey);
}

export function getClientRefreshToken() {
  return (
    localStorage.getItem(app.refreshTokenStoreKey) ??
    sessionStorage.getItem(app.refreshTokenStoreKey)
  );
}

export function removeAllTokens() {
  removeClientAccessToken();
  removeClientRefreshToken();
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = getClientRefreshToken();
  if (!refreshToken) {
    return null;
  }

  // Avoid multiple concurrent refresh calls
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = client
    .post("/auth/refresh", { refresh_token: refreshToken })
    .then((res) => {
      const data = res.data?.data ?? res.data;
      const access = data?.access_token;
      const refresh = data?.refresh_token;
      if (access) {
        setClientAccessToken(access);
      }
      if (refresh) {
        setClientRefreshToken(refresh);
      }
      return access ?? null;
    })
    .catch(() => {
      removeAllTokens();
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.config?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const originalRequest = error?.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await refreshTokens();
      if (newAccess) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.authorization = `Bearer ${newAccess}`;
        return client(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export function loadAccessToken() {
  // Now handled by request interceptor
}

export function getClientAccessToken() {
  return (
    localStorage.getItem(app.accessTokenStoreKey) ??
    sessionStorage.getItem(app.accessTokenStoreKey)
  );
}

export function checkClientAccessToken() {
  const token = getClientAccessToken();
  invariant(!!token, "No access token found");
  return token;
}
