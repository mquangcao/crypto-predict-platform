"use client";

import { useState } from "react";
import { cn } from "../utils/cn";

const menus = [
  { id: "dashboard", label: "Dashboard" },
  { id: "market", label: "Thị trường" },
  { id: "news", label: "Tin tức" },
  { id: "ai", label: "AI Insight" },
];

export function Sidebar() {
  const [active, setActive] = useState("dashboard");

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
            onClick={() => setActive(item.id)}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2 text-sm transition",
              active === item.id
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
