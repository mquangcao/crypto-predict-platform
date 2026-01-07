"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingScreen } from "@/components/loading-screen";
import { app } from "@/config";
import { useAuth } from "@/hooks";

interface GuestGuardProps {
  children: ReactNode;
}

function getRedirectPath(searchParams: URLSearchParams | null) {
  return searchParams?.get(app.redirectQueryParamName) ?? "/";
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const redirectPath = getRedirectPath(searchParams);
      router.replace(redirectPath);
    }
  }, [isInitialized, isAuthenticated, searchParams, router]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
