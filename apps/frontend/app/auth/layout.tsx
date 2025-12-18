import { ReactNode } from "react";
import { Cpu, TrendingUp, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-50 font-sans text-text-main antialiased min-h-screen flex flex-col relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Subtle global background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10">
        {/* Main Card with the distinct double-border effect */}
        <div className="relative w-full max-w-5xl group">
          {/* Subtle outer glow/border */}
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-500/15 via-indigo-500/5 to-purple-500/15 rounded-[2.6rem] blur-sm opacity-60"></div>

          <div className="relative w-full bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden grid lg:grid-cols-5">
            {/* Left Column - Visuals with VIBRANT gradient and blooms */}
            <div className="hidden lg:flex lg:col-span-2 bg-slate-50/50 relative overflow-hidden flex-col items-center justify-center p-12 border-r border-slate-100">
              {/* VIBRANT GRADIENT BASE */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-50/40 to-white"></div>

              {/* INNER BLOOMS fofr more "col-bot" / "khac-biet" feeling */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

              <div className="relative w-full max-w-[340px] perspective-1000 z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-slate-200/40 rounded-full opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-blue-100/40 rounded-full opacity-60"></div>

                <div className="relative bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] p-6 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_70px_-15px_rgba(59,130,246,0.15)] group/card">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Portfolio AI
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        System Active
                      </p>
                    </div>
                    <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                      <TrendingUp size={20} />
                    </div>
                  </div>

                  <div className="relative h-40 w-full mb-6">
                    <svg
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 50"
                    >
                      <defs>
                        <linearGradient
                          id="chartFill"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity="0.25"
                          ></stop>
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity="0"
                          ></stop>
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,50 L0,35 C20,32 30,42 45,30 C60,18 75,22 85,10 C92,2 100,5 100,0 V50 Z"
                        fill="url(#chartFill)"
                      ></path>
                      <path
                        d="M0,35 C20,32 30,42 45,30 C60,18 75,22 85,10 C92,2 100,5 100,0"
                        fill="none"
                        stroke="#3b82f6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      ></path>
                      <path
                        d="M0,40 C25,38 40,45 60,35 C80,25 90,30 100,20"
                        strokeDasharray="3,3"
                        fill="none"
                        stroke="#94a3b8"
                        strokeOpacity="0.3"
                        strokeWidth="1.5"
                      ></path>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 transition-colors">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Forecast
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        $142k
                      </div>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-50 transition-colors">
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">
                        Load
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-5 -left-8 bg-white p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-50 flex items-center gap-3 animate-float">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/20">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Engine
                    </div>
                    <div className="text-[13px] font-extrabold text-slate-900">
                      Neural Processing
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -right-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-50 animate-float animation-delay-2000">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap
                      size={18}
                      className="text-orange-500 fill-orange-500"
                    />
                    <span className="text-[12px] font-bold text-slate-800">
                      Smart Alert
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed max-w-[130px]">
                    Analysis complete in{" "}
                    <span className="text-blue-600 font-bold">4.2ms</span>.
                  </p>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
