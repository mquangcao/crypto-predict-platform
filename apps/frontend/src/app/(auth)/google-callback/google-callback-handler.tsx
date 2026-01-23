"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth, useExchangeOAuthCode } from "@/hooks";

export function GoogleCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated } = useAuth();
  const { mutate: exchangeCode } = useExchangeOAuthCode();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      toast.error(`Google login failed: ${error}`);
      router.push("/login");
      return;
    }

    if (!code) {
      toast.error("No authorization code received");
      router.push("/login");
      return;
    }

    exchangeCode({ variables: { code } } as any, {
      onSuccess: () => {
        setIsAuthenticated(true);
      },
    });
  }, [searchParams, router, setIsAuthenticated, exchangeCode]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="text-sm text-muted-foreground">
        Completing Google login...
      </p>
    </div>
  );
}
