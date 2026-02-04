"use client";

import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useHandlePaymentCallback } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const handleCallback = useHandlePaymentCallback();

  const initialStatus = !searchParams.get("orderId") ? "failed" : "loading";
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    initialStatus,
  );
  const processedRef = useRef(false);

  // Extract all params from MoMo
  const params = useMemo(
    () => ({
      partnerCode: searchParams.get("partnerCode"),
      orderId: searchParams.get("orderId"),
      requestId: searchParams.get("requestId"),
      amount: searchParams.get("amount"),
      orderInfo: searchParams.get("orderInfo"),
      orderType: searchParams.get("orderType"),
      transId: searchParams.get("transId"),
      resultCode: searchParams.get("resultCode"),
      message: searchParams.get("message"),
      payType: searchParams.get("payType"),
      responseTime: searchParams.get("responseTime"),
      extraData: searchParams.get("extraData"),
      signature: searchParams.get("signature"),
    }),
    [searchParams],
  );

  useEffect(() => {
    if (processedRef.current) return;

    const triggerVerification = async () => {
      try {
        // resultCode '0' means transaction accepted in MoMo
        if (params.resultCode === "0") {
          const result = (await handleCallback.mutateAsync({
            route: { method: "MOMO" },
            variables: params,
          } as any)) as any;

          if (result.data.status === "SUCCESS") {
            setStatus("success");
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
        toast.error("Failed to verify payment with server.");
      }
    };

    // Only proceed if we have the critical orderId and resultCode
    if (params.orderId && params.resultCode !== null) {
      processedRef.current = true;
      triggerVerification();
    }
  }, [params, handleCallback]);

  const isSuccess = status === "success";

  if (status === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">
            Validating Transaction
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            Synchronizing with payment gateway...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#fcfdfe]">
      <div className="max-w-md w-full space-y-10 animate-in zoom-in-95 duration-500">
        {/* Status Card */}
        <div
          className={cn(
            "relative overflow-hidden border-2 p-10 text-center space-y-8 shadow-2xl transition-all duration-300",
            isSuccess
              ? "bg-white border-slate-900"
              : "bg-white border-rose-100",
          )}
        >
          {/* Top Bar Decoration */}
          <div
            className={cn(
              "absolute top-0 inset-x-0 h-1",
              isSuccess ? "bg-slate-900" : "bg-rose-500",
            )}
          />

          <div className="flex justify-center">
            {isSuccess ? (
              <div className="bg-emerald-50 text-emerald-600 p-5 rounded-full ring-8 ring-emerald-50/50">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
            ) : (
              <div className="bg-rose-50 text-rose-600 p-5 rounded-full ring-8 ring-rose-50/50">
                <XCircle size={48} strokeWidth={2.5} />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <h1
              className={cn(
                "text-3xl font-black uppercase tracking-tighter italic leading-none",
                isSuccess ? "text-slate-900" : "text-rose-600",
              )}
            >
              {isSuccess ? "UPGRADE SUCCESSFUL" : "PAYMENT FAILED"}
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
              {isSuccess
                ? "Your VIP status has been activated. Welcome to the elite tier."
                : params.message ||
                  "We couldn't process your transaction. Please try again."}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-1 border-y border-slate-50 py-6">
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                Transaction ID
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {params.transId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                Amount
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-950 underline decoration-indigo-200 underline-offset-4">
                {Number(params.amount || 0).toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                Method
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter italic">
                MoMo Wallet
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              asChild
              className="h-14 rounded-none bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-600 shadow-xl shadow-slate-200"
            >
              <Link
                href={isSuccess ? "/account/billing" : "/checkout"}
                className="flex gap-3 justify-center items-center"
              >
                {isSuccess ? "View Billing" : "Try Again"}{" "}
                <ArrowRight size={16} />
              </Link>
            </Button>
            {isSuccess && (
              <Button
                asChild
                variant="outline"
                className="h-14 rounded-none border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:text-slate-900 hover:bg-slate-50"
              >
                <Link
                  href="/"
                  className="flex gap-3 justify-center items-center"
                >
                  Back to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-900">
            <ShieldCheck size={14} /> Secured Gateway
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-200" />
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-900">
            <ReceiptText size={14} /> SSL Encrypted
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-20">
      <Suspense
        fallback={
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              Pre-fetching Payment Data...
            </p>
          </div>
        }
      >
        <PaymentResultContent />
      </Suspense>
    </div>
  );
}
