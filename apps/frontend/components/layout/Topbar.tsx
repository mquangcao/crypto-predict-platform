"use client";

export function Topbar() {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* Logo mobile */}
        <div className="md:hidden text-lg font-semibold">
          <span className="text-indigo-500">Crypto</span>Lab
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Live BTCUSDT</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 hidden sm:inline">Xin chào, User</span>
        <button className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
