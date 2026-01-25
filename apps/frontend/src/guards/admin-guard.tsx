"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/hooks";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace("/login");
      }
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return notFound();
  }

  return children;
}
