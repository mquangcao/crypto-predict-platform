"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/query-client";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
