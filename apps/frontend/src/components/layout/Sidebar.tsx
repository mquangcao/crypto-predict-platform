"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "../utils/cn";

const menus = [
  { id: "dashboard", label: "Dashboard", path: "/" },
  { id: "market", label: "Thị trường", path: "/" },
  { id: "news", label: "Tin tức", path: "/news" },
  { id: "ai", label: "AI Insights", path: "/ai" },
];

export function Sidebar() {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");

  const handleMenuClick = (item: (typeof menus)[0]) => {
    setActive(item.id);
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <aside className="hidden md:flex md:flex-col w-60 bg-slate-950 border-r border-slate-800">
      <div className="h-16 px-4 flex items-center border-b border-slate-800">
        <span className="text-lg font-semibold">
          <span className="text-indigo-500">Crypto</span>Lab
        </span>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menus.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2 text-sm transition",
              active === item.id
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
