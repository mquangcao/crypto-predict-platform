"use client";

type Props = {
  symbol: string;
  onChangeSymbol: (symbol: string) => void;
};

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

export function SymbolSelector({ symbol, onChangeSymbol }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 uppercase tracking-wide">
        Symbol
      </span>
      <select
        className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
        value={symbol}
        onChange={(e) => onChangeSymbol(e.target.value)}
      >
        {symbols.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
