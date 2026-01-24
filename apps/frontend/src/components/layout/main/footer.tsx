import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-slate-100 mt-auto shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto w-full px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">
            Support
          </Link>
        </div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          CryptoLab Global Ecosystem © 2026
        </p>
      </div>
    </footer>
  );
}
