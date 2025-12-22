export const app = {
  name: "CryptoPlatform",
  apiBaseUrl: process.env.VITE_API_BASE_URL || "/api",
  redirectQueryParamName: "r",
  accessTokenStoreKey: "access_token",
  refreshTokenStoreKey: "refresh_token",
};
