import { toast } from "sonner";
import { z } from "zod";
import {
  removeAllTokens,
  setClientAccessToken,
  setClientRefreshToken,
} from "@/api/axios";
import {
  ExchangeOAuthCodeRequestSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
} from "@/api/dtos/auth";
import { createPostMutationHook } from "@/api/helpers";

export const useLogin = createPostMutationHook({
  endpoint: "/auth/login",
  bodySchema: LoginRequestSchema,
  responseSchema: LoginResponseSchema,
  rMutationParams: {
    onSuccess: (res) => {
      setClientAccessToken(res.data.access_token);
      setClientRefreshToken(res.data.refresh_token);
      toast.success("You have successfully logged in");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  },
});

export const useRegister = createPostMutationHook({
  endpoint: "/auth/register",
  bodySchema: RegisterRequestSchema,
  responseSchema: LoginResponseSchema,
  rMutationParams: {
    onSuccess: (res) => {
      setClientAccessToken(res.data.access_token);
      setClientRefreshToken(res.data.refresh_token);
      toast.success("Registration successful");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  },
});

export const useLogout = createPostMutationHook({
  endpoint: "/auth/logout",
  bodySchema: z.undefined(),
  responseSchema: z.any(),
  rMutationParams: {
    onSuccess: () => {
      removeAllTokens();
      toast.success("You have successfully logged out");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  },
});

export const useRefreshToken = createPostMutationHook({
  endpoint: "/auth/refresh",
  bodySchema: RefreshTokenRequestSchema,
  responseSchema: LoginResponseSchema,
  rMutationParams: {
    onSuccess: (res) => {
      setClientAccessToken(res.data.access_token);
      setClientRefreshToken(res.data.refresh_token);
    },
    onError: (error) => {
      toast.error(error.message);
      removeAllTokens();
    },
  },
});

// Helper hook that automatically provides the refresh token
export const useLogoutWithRefreshToken = () => {
  const logoutMutation = useLogout();

  const logout = (options?: Parameters<typeof logoutMutation.mutate>[1]) => {
    logoutMutation.mutate({ variables: undefined } as any, options);
  };

  return {
    ...logoutMutation,
    mutate: logout,
  };
};

export const useExchangeOAuthCode = createPostMutationHook({
  endpoint: "/auth/oauth/exchange",
  bodySchema: ExchangeOAuthCodeRequestSchema,
  responseSchema: LoginResponseSchema,
  rMutationParams: {
    onSuccess: (res) => {
      setClientAccessToken(res.data.access_token);
      setClientRefreshToken(res.data.refresh_token);
      toast.success("Successfully logged in with Google");
    },
    onError: (error) => {
      toast.error(error.message || "Google login failed");
    },
  },
});
