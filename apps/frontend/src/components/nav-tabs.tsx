"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavTabItem {
  label: string;
  path: string;
}

interface NavTabsProps {
  items: NavTabItem[];
  className?: string;
}

export function NavTabs({ items, className }: NavTabsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-6", className)}>
      {items.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "text-sm font-medium transition-colors hover:text-sky-500 relative py-1",
              isActive
                ? "text-sky-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500 after:rounded-full"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
