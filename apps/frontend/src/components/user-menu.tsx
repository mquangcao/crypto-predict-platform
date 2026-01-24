"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.split("@")[0].substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-500/40 active:ring-blue-500/60 focus:ring-2 focus:ring-blue-500/40 hover:bg-blue-50 active:bg-blue-100 hover:cursor-pointer transition-all border border-slate-200"
        >
          <Avatar className="h-10 w-10 border-2 border-blue-100">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-sm shadow-inner">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64"
        align="end"
        forceMount
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal py-3 flex items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">
                {user?.fullName?.split("@")[0] || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="flex items-center cursor-pointer py-2.5"
        >
          <Link href="/account/settings" className="flex items-center w-full">
            <Settings className="mr-3 h-4 w-4" />
            <span className="font-medium">Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 py-2.5"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
