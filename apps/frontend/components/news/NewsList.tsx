const mockNews = [
  {
    id: 1,
    source: "CoinDesk",
    title: "Bitcoin test lại vùng kháng cự mạnh 100k USDT",
    time: "5 phút trước",
    sentiment: "bullish",
  },
  {
    id: 2,
    source: "Binance News",
    title: "Dòng tiền lớn đổ vào BTC ETF, thị trường altcoin xanh mạnh",
    time: "30 phút trước",
    sentiment: "bullish",
  },
  {
    id: 3,
    source: "Twitter",
    title: "FUD về quy định mới khiến thị trường rung lắc",
    time: "1 giờ trước",
    sentiment: "bearish",
  },
];

const sentimentColor: Record<string, string> = {
  bullish: "text-emerald-400 bg-emerald-500/10",
  bearish: "text-rose-400 bg-rose-500/10",
  neutral: "text-slate-300 bg-slate-600/20",
};

export function NewsList() {
  return (
    <ul className="space-y-2 text-xs">
      {mockNews.map((n) => (
        <li
          key={n.id}
          className="px-2 py-1 rounded-lg hover:bg-slate-800/70 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] text-slate-400">{n.source}</span>
            <span
              className={
                "px-1.5 py-0.5 rounded-full text-[10px] capitalize " +
                sentimentColor[n.sentiment]
              }
            >
              {n.sentiment}
            </span>
          </div>
          <div className="text-[13px] leading-snug">{n.title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{n.time}</div>
        </li>
      ))}
    </ul>
  );
}
