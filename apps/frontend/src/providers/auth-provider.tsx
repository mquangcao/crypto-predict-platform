/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { checkClientAccessToken, client, loadAccessToken } from "@/api/axios";
import { User } from "@/api/entities";
import { useLogoutWithRefreshToken } from "@/hooks";
import { BaseResponseSchema } from "@/api/common";

interface AuthContextValues {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: (options?: {
    onSuccess?: () => void;
    onError?: (err: any) => void;
  }) => void;
}

export async function getAccountInfo(): Promise<User> {
  checkClientAccessToken();

  const response = await client.get("/user/me");
  const validatedResponse = BaseResponseSchema(User).parse(response.data);
  return validatedResponse.data;
}

export const AuthContext = createContext<AuthContextValues | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { mutate: logout } = useLogoutWithRefreshToken();

  const refreshUser = async () => {
    try {
      const fetchedUser = await getAccountInfo();
      setUser(fetchedUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  useEffect(() => {
    loadAccessToken();

    getAccountInfo()
      .then((user) => {
        setUser(user);
        setIsAuthenticated(true);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsInitialized(true));
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isInitialized,
      user,
      setIsAuthenticated,
      refreshUser,
      logout: (options?: {
        onSuccess?: () => void;
        onError?: (err: unknown) => void;
      }) => {
        try {
          logout({
            onSuccess: () => {
              setIsAuthenticated(false);
              setUser(null);
              window.location.assign("/login");
              options?.onSuccess?.();
            },
            onError: (err: unknown) => {
              setIsAuthenticated(false);
              setUser(null);
              window.location.assign("/login");
              options?.onError?.(err);
            },
          });
        } catch (err: unknown) {
          setIsAuthenticated(false);
          setUser(null);
          window.location.assign("/login");
          options?.onError?.(err);
        }
      },
    }),
    [isAuthenticated, isInitialized, logout, user, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
