'use client';

import React, { useState, useTransition } from "react";
import { adminApproveWithdrawalAction, adminRejectWithdrawalAction, adminCreditWalletAction } from "@/actions/wallet";
import Button from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AdminWalletClientProps {
  withdrawals: any[];
}

export default function AdminWalletClient({ withdrawals: initialWithdrawals }: AdminWalletClientProps) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [isPending, startTransition] = useTransition();

  // Credit adjustment states
  const [targetEmail, setTargetEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditError, setCreditError] = useState("");
  const [creditSuccess, setCreditSuccess] = useState(false);

  // Reject modal states
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id: string) => {
    if (!confirm("Are you sure you want to approve this withdrawal request?")) return;

    startTransition(async () => {
      const res = await adminApproveWithdrawalAction(id);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "COMPLETED" } : w))
        );
      } else {
        alert(res.error || "Failed to approve withdrawal.");
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;

    startTransition(async () => {
      const res = await adminRejectWithdrawalAction(rejectId, rejectReason);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === rejectId ? { ...w, status: "FAILED" } : w))
        );
        setRejectId(null);
        setRejectReason("");
      } else {
        alert(res.error || "Failed to reject withdrawal.");
      }
    });
  };

  const handleCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditError("");
    setCreditSuccess(false);

    const amountRupees = parseFloat(creditAmount);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      setCreditError("Please enter a valid positive amount.");
      return;
    }

    if (!targetEmail.trim() || !creditReason.trim()) {
      setCreditError("Please fill out all fields.");
      return;
    }

    const amountPaise = Math.round(amountRupees * 100);

    startTransition(async () => {
      const res = await adminCreditWalletAction(targetEmail, amountPaise, creditReason);
      if (res.success) {
        setCreditSuccess(true);
        setTargetEmail("");
        setCreditAmount("");
        setCreditReason("");
      } else {
        setCreditError(res.error || "Failed to issue credit.");
      }
    });
  };

  return (
    <div className="space-y-12 font-sans text-left">
      {/* Reject Modal Overlay */}
      {rejectId && (
        <div className="fixed inset-0 bg-brand-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <div className="bg-[#FFF9F4] border border-brand-black/5 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h4 className="font-display text-lg text-brand-black">Reject Withdrawal</h4>
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-400">
                  Reason for Rejection
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Account name mismatch / Invalid destination details"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                  className="flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg"
                >
                  Confirm Reject
                </Button>
                <button
                  type="button"
                  onClick={() => setRejectId(null)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-brand-black cursor-pointer border border-brand-black/10 bg-transparent rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
        {/* Left Column: Withdrawal Payout Queue */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-display text-xl text-brand-black border-b border-brand-black/5 pb-3">
            Withdrawal Request Queue
          </h3>

          <div className="overflow-x-auto border border-brand-black/5 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-brand-black/5 text-[#77716A] text-[9px] uppercase tracking-wider font-bold text-left border-b border-brand-black/5">
                  <th className="p-4 pl-6">Customer</th>
                  <th className="p-4">Requested</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-neutral-400 italic">
                      No withdrawal requests in queue.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const dateStr = new Date(w.requestedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const pm = w.payoutMethod || {};

                    return (
                      <tr key={w.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4 pl-6 font-semibold text-brand-black">
                          {w.user?.email || "unknown@example.com"}
                        </td>
                        <td className="p-4 text-neutral-500">{dateStr}</td>
                        <td className="p-4 font-bold text-brand-black">
                          ₹{(w.amountPaise / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-neutral-400 leading-tight">
                          {pm.type === "UPI" ? (
                            <span>UPI: {pm.upiId}</span>
                          ) : (
                            <span>Bank Acc: ••••{pm.bankAccountLast4} ({pm.ifsc})</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[8px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 ${
                            w.status === "COMPLETED"
                              ? "bg-[#7C7A5A]/10 text-[#7C7A5A]"
                              : w.status === "FAILED" || w.status === "CANCELLED"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right flex items-center justify-end gap-2.5">
                          {w.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(w.id)}
                                disabled={isPending}
                                className="text-[10px] text-[#7C7A5A] font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectId(w.id)}
                                disabled={isPending}
                                className="text-[10px] text-red-600 font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Goodwill Credit Adjustments */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-display text-xl text-brand-black border-b border-brand-black/5 pb-3">
            Issue Wallet Credit
          </h3>

          <div className="bg-[#FFF9F4] border border-brand-black/5 p-6 rounded-2xl space-y-4 text-xs shadow-xs">
            <span className="text-[9px] tracking-widest uppercase font-bold text-[#77716A] block pl-0.5 mb-2">
              Goodwill Adjustment Form
            </span>

            {creditError && (
              <div className="p-3.5 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-xs font-semibold rounded-lg">
                ⚠️ {creditError}
              </div>
            )}

            {creditSuccess && (
              <div className="p-3.5 bg-[#7C7A5A]/10 border border-[#7C7A5A]/20 text-[#7C7A5A] text-xs font-semibold rounded-lg">
                ✓ Wallet credited successfully.
              </div>
            )}

            <form onSubmit={handleCredit} className="space-y-4">
              <div className="space-y-1">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-500 pl-0.5">
                  Customer Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-500 pl-0.5">
                  Credit Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs font-semibold text-neutral-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-500 pl-0.5">
                  Reason for Credit
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delayed delivery refund / Customer goodwill"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="w-full py-3 text-xs font-bold tracking-widest uppercase rounded-lg flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Issue Credit Balance
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
