"use client";

import { forwardRef } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";

export type LogoutButtonProps = React.ComponentProps<typeof Button>;

export const LogoutButton = forwardRef<HTMLButtonElement, LogoutButtonProps>(
  ({ onClick, ...props }, ref) => {
    const { logout } = useAuth();

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      logout?.({
        onSuccess: () => onClick?.(e),
      });
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        onClick={handleLogout}
        className="text-destructive border-destructive hover:bg-destructive hover:text-white cursor-pointer"
        {...props}
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    );
  },
);

LogoutButton.displayName = "LogoutButton";
