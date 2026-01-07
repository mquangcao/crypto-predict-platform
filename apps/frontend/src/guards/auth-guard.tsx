"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loading-screen";
import { app } from "@/config";
import { useAuth } from "@/hooks";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/login?${app.redirectQueryParamName}=${pathname}`);
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
