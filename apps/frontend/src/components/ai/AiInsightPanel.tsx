export function AiInsightPanel() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
      <h2 className="text-sm font-semibold mb-2">AI Insight (mock)</h2>
      <p className="text-xs text-slate-300 mb-3">
        Mô hình AI dự đoán:{" "}
        <span className="text-emerald-400 font-semibold">UP</span> trong 1 giờ
        tới cho cặp <span className="font-mono">BTCUSDT</span>.
      </p>
      <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
        <li>Dòng tiền vào BTC tăng 12% so với trung bình 7 ngày.</li>
        <li>Tin tức tích cực về ETF BTC tại Mỹ 24h gần nhất.</li>
        <li>Không phát hiện FUD lớn trên các kênh chính.</li>
      </ul>
      <p className="text-[11px] text-slate-500 mt-3">
        * Đây là dữ liệu mock. Sau này sẽ lấy dữ liệu thật từ News+AI service.
      </p>
    </div>
  );
}
