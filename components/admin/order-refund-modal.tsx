'use client';

import React, { useState, useTransition } from "react";
import { createRefundAction } from "@/actions/refund";
import { RefreshCw, RotateCcw, AlertCircle, CheckCircle2, Wallet, CreditCard } from "lucide-react";

interface ExistingRefund {
  id: string;
  amountPaise: number;
  reason: string;
  refundMethod: string;
  status: string;
  createdAt: Date | string;
}

interface OrderRefundModalProps {
  orderId: string;
  orderNumber: string;
  totalPaise: number;
  paymentStatus: string;
  existingRefunds: ExistingRefund[];
}

export default function OrderRefundModal({
  orderId,
  orderNumber,
  totalPaise,
  paymentStatus,
  existingRefunds,
}: OrderRefundModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalAlreadyRefundedPaise = existingRefunds
    .filter((r) => r.status !== "FAILED")
    .reduce((sum, r) => sum + r.amountPaise, 0);

  const remainingRefundablePaise = Math.max(0, totalPaise - totalAlreadyRefundedPaise);

  const [refundAmountStr, setRefundAmountStr] = useState((remainingRefundablePaise / 100).toString());
  const [refundMethod, setRefundMethod] = useState<"rc_wallet" | "original_payment_method">("rc_wallet");
  const [reason, setReason] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpen = () => {
    setRefundAmountStr((remainingRefundablePaise / 100).toString());
    setErrorMsg("");
    setSuccessMsg("");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const amountRupees = parseFloat(refundAmountStr);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      setErrorMsg("Please enter a valid positive refund amount.");
      return;
    }

    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise > remainingRefundablePaise) {
      setErrorMsg(`Amount cannot exceed remaining refundable balance of ₹${(remainingRefundablePaise / 100).toFixed(2)}.`);
      return;
    }

    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for the refund.");
      return;
    }

    startTransition(async () => {
      const res = await createRefundAction(orderId, null, amountPaise, reason.trim(), refundMethod);
      if (res.success) {
        setSuccessMsg(res.message || "Refund processed successfully.");
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setErrorMsg(res.error || "Failed to process refund.");
      }
    });
  };

  return (
    <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs text-xs space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-brand-pink" />
          <span>Refund Operations</span>
        </h4>
        <button
          type="button"
          onClick={handleOpen}
          disabled={paymentStatus !== "PAID" || remainingRefundablePaise <= 0}
          className="px-4 py-2 bg-brand-black text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest font-bold rounded-xs transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Refund Order</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
        <div className="bg-neutral-50 p-3 rounded-xs border border-neutral-100">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Already Refunded</span>
          <span className="font-semibold text-neutral-700">₹{(totalAlreadyRefundedPaise / 100).toLocaleString("en-IN")}</span>
        </div>
        <div className="bg-neutral-50 p-3 rounded-xs border border-neutral-100">
          <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Refundable Balance</span>
          <span className="font-bold text-brand-sage">₹{(remainingRefundablePaise / 100).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* List of Previous Refunds if any */}
      {existingRefunds.length > 0 && (
        <div className="space-y-2 border-t border-neutral-100 pt-3">
          <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">Refund Logs ({existingRefunds.length})</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {existingRefunds.map((ref) => (
              <div key={ref.id} className="flex justify-between items-center bg-neutral-50 p-2 rounded-xs border border-neutral-100 text-[10px]">
                <div>
                  <span className="font-semibold block text-brand-black">₹{(ref.amountPaise / 100).toLocaleString("en-IN")}</span>
                  <span className="text-neutral-400 block">{ref.reason} ({ref.refundMethod})</span>
                </div>
                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-xs ${ref.status === "COMPLETED" ? "bg-brand-sage text-white" : "bg-amber-500 text-white"}`}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REFUND MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xs shadow-xl space-y-5 border border-brand-black/10">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-brand-black">
                Process Order Refund (#{orderNumber})
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-brand-black text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-brand-sage/10 border border-brand-sage/30 text-brand-sage text-xs font-semibold rounded-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500 block">
                  Refund Amount (₹) — Max: ₹{(remainingRefundablePaise / 100).toFixed(2)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={remainingRefundablePaise / 100}
                  required
                  value={refundAmountStr}
                  onChange={(e) => setRefundAmountStr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-bold font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500 block">
                  Refund Destination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setRefundMethod("rc_wallet")}
                    className={`p-3 border rounded-xs cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      refundMethod === "rc_wallet"
                        ? "border-brand-sage bg-brand-sage/5 ring-1 ring-brand-sage"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-brand-black text-[10px] uppercase">
                      <Wallet className="h-3.5 w-3.5 text-brand-sage" />
                      <span>RC Wallet Credit</span>
                    </div>
                    <span className="text-[9px] text-neutral-400 leading-tight">Instant store credit to user wallet</span>
                  </label>

                  <label
                    onClick={() => setRefundMethod("original_payment_method")}
                    className={`p-3 border rounded-xs cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      refundMethod === "original_payment_method"
                        ? "border-brand-sage bg-brand-sage/5 ring-1 ring-brand-sage"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-brand-black text-[10px] uppercase">
                      <CreditCard className="h-3.5 w-3.5 text-neutral-600" />
                      <span>Razorpay Refund</span>
                    </div>
                    <span className="text-[9px] text-neutral-400 leading-tight">Back to original payment method</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-500 block">
                  Reason for Refund *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Customer requested cancellation / Item damaged"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-600 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold rounded-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Execute Refund</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
