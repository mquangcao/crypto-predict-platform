export function PriceChartSkeleton() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Biểu đồ giá (mock)</span>
        <div className="space-x-1">
          {["1m", "5m", "1h", "1d"].map((tf) => (
            <button
              key={tf}
              className="px-2 py-0.5 rounded-full border border-slate-700 text-[10px] hover:bg-slate-800"
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center text-xs text-slate-500">
        Chart placeholder – sẽ gắn TradingView / lightweight-charts sau
      </div>
    </div>
  );
}
