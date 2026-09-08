'use client';

import React, { useState, useTransition } from "react";
import { addPayoutMethodAction, deletePayoutMethodAction, requestWithdrawalAction } from "@/actions/wallet";
import Button from "@/components/ui/button";
import {
  Landmark,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";

interface WalletClientProps {
  wallet: {
    availableBalancePaise: number;
    lockedBalancePaise: number;
    currency: string;
  };
  transactions: any[];
  payoutMethods: any[];
  withdrawals: any[];
}

export default function WalletClient({
  wallet,
  transactions,
  payoutMethods: initialPayoutMethods,
  withdrawals: initialWithdrawals,
}: WalletClientProps) {
  const [payoutMethods, setPayoutMethods] = useState(initialPayoutMethods);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [isPending, startTransition] = useTransition();

  const [activeMethodId, setActiveMethodId] = useState(initialPayoutMethods[0]?.id || "");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState("");

  // Form states for adding new payout method
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"UPI" | "BANK">("UPI");
  const [newHolderName, setNewHolderName] = useState("");
  const [newUpiId, setNewUpiId] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newConfirmAccountNumber, setNewConfirmAccountNumber] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [addError, setAddError] = useState("");
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);

  const handleAddPayoutMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    const name = newHolderName.trim();
    if (!name || name.length < 2) {
      setAddError("Account holder name must be at least 2 characters.");
      return;
    }

    if (newMethodType === "UPI") {
      const upi = newUpiId.trim();
      if (!upi) {
        setAddError("UPI ID is required.");
        return;
      }
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi)) {
        setAddError("Please enter a valid UPI ID (e.g. username@okhdfcbank or 9876543210@paytm).");
        return;
      }
    }

    if (newMethodType === "BANK") {
      const acc = newAccountNumber.trim().replace(/[\s\-]/g, "");
      const confirmAcc = newConfirmAccountNumber.trim().replace(/[\s\-]/g, "");
      const ifsc = newIfsc.trim().toUpperCase();

      if (!acc) {
        setAddError("Bank account number is required.");
        return;
      }
      if (!/^\d{9,18}$/.test(acc)) {
        setAddError("Bank account number must be 9 to 18 digits.");
        return;
      }
      if (acc !== confirmAcc) {
        setAddError("Account numbers do not match. Please re-check.");
        return;
      }
      if (!ifsc) {
        setAddError("Bank IFSC code is required.");
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
        setAddError("Please enter a valid 11-character Indian IFSC code (e.g. HDFC0001234, SBIN0001234).");
        return;
      }
    }

    startTransition(async () => {
      const res = await addPayoutMethodAction({
        type: newMethodType,
        accountHolderName: name,
        upiId: newMethodType === "UPI" ? newUpiId.trim() : undefined,
        accountNumber: newMethodType === "BANK" ? newAccountNumber.trim().replace(/[\s\-]/g, "") : undefined,
        ifsc: newMethodType === "BANK" ? newIfsc.trim().toUpperCase() : undefined,
      });

      if (res.success && res.payoutMethod) {
        setIsAddOpen(false);
        const updatedMethods = [res.payoutMethod, ...payoutMethods];
        setPayoutMethods(updatedMethods);
        setActiveMethodId(res.payoutMethod.id);

        // Reset forms
        setNewHolderName("");
        setNewUpiId("");
        setNewAccountNumber("");
        setNewConfirmAccountNumber("");
        setNewIfsc("");
      } else {
        setAddError(res.error || "Failed to add payout method.");
      }
    });
  };

  const handleDeleteMethod = (methodId: string) => {
    if (!confirm("Are you sure you want to remove this payout destination?")) return;
    setDeletingMethodId(methodId);

    startTransition(async () => {
      const res = await deletePayoutMethodAction(methodId);
      setDeletingMethodId(null);
      if (res.success) {
        const filtered = payoutMethods.filter((m) => m.id !== methodId);
        setPayoutMethods(filtered);
        if (activeMethodId === methodId) {
          setActiveMethodId(filtered[0]?.id || "");
        }
      } else {
        alert(res.error || "Failed to delete payout method.");
      }
    });
  };

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccessMsg("");

    const amountRupees = parseFloat(withdrawAmount);
    if (isNaN(amountRupees) || amountRupees <= 0) {
      setWithdrawError("Please enter a valid positive amount.");
      return;
    }

    const amountPaise = Math.round(amountRupees * 100);
    if (amountPaise < 100) {
      setWithdrawError("Minimum withdrawal amount is ₹1.");
      return;
    }
    if (wallet.availableBalancePaise <= 0) {
      setWithdrawError("Your available balance is ₹0. You need a positive store balance to request a payout.");
      return;
    }
    if (amountPaise > wallet.availableBalancePaise) {
      setWithdrawError(
        `Cannot withdraw ₹${amountRupees.toFixed(2)}. Your available balance is ₹${(
          wallet.availableBalancePaise / 100
        ).toFixed(2)}.`
      );
      return;
    }
    if (!activeMethodId) {
      setWithdrawError("Please select or add a verified payout destination (UPI ID or Bank Account) below.");
      return;
    }

    startTransition(async () => {
      const res = await requestWithdrawalAction(amountPaise, activeMethodId);
      if (res.success) {
        setWithdrawSuccessMsg(res.message || "Withdrawal request submitted successfully!");
        setWithdrawAmount("");

        if (res.withdrawal) {
          setWithdrawals([res.withdrawal, ...withdrawals]);
        }

        // Update local wallet available/locked balances
        wallet.availableBalancePaise -= amountPaise;
        wallet.lockedBalancePaise += amountPaise;
      } else {
        setWithdrawError(res.error || "Failed to process withdrawal request.");
      }
    });
  };

  const handleQuickAmount = (rupees: number) => {
    const maxRupees = wallet.availableBalancePaise / 100;
    const finalAmount = Math.min(rupees, maxRupees);
    if (finalAmount > 0) {
      setWithdrawAmount(finalAmount.toString());
    }
  };

  const totalBalancePaise = wallet.availableBalancePaise + wallet.lockedBalancePaise;

  return (
    <div className="space-y-12 font-sans text-left">
      {/* 1. Header Overview & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-4 bg-white border border-brand-black/10 p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#324027] block">
              TOTAL RC WALLET BALANCE
            </span>
            <div className="font-display text-4xl sm:text-5xl text-brand-black font-normal tracking-tight">
              ₹{(totalBalancePaise / 100).toLocaleString("en-IN")}
            </div>
          </div>
          <p className="text-xs text-[#77716A] leading-relaxed mt-4 pt-4 border-t border-neutral-100">
            Store credits can be applied directly during checkout, or withdrawn directly to your Indian bank or UPI ID.
          </p>
        </div>

        {/* Available to Spend/Withdraw card */}
        <div className="md:col-span-4 bg-[#F7F9F5] border border-[#324027]/25 p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-[#324027] block mb-1">
              Available to Spend & Withdraw
            </span>
            <span className="font-sans text-3xl font-bold text-[#324027]">
              ₹{(wallet.availableBalancePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-[11px] text-[#324027] flex items-center gap-1.5 font-bold mt-4 pt-3 border-t border-[#324027]/10 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#324027]" />
            100% Cash Withdrawable
          </div>
        </div>

        {/* Locked for processing card */}
        <div className="md:col-span-4 bg-white border border-brand-black/10 p-6 sm:p-7 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-neutral-500 block mb-1">
              Locked in Payout Processing
            </span>
            <span className="font-sans text-3xl font-bold text-neutral-600">
              ₹{(wallet.lockedBalancePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-semibold mt-4 pt-3 border-t border-neutral-100 uppercase tracking-wider">
            {wallet.lockedBalancePaise > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#7C7A5A]" />
                Transferring to Bank/UPI
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                No active transfer locks
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 pt-6 border-t border-brand-black/10">
        {/* Left Column: Withdrawal Form and Payout Management */}
        <div className="lg:col-span-7 space-y-10">
          {/* A. Withdrawal Form */}
          <div className="bg-[#FAF9F5] border border-brand-black/10 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
            <div className="border-b border-brand-black/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl text-brand-black">
                  Request Payout / Withdrawal
                </h3>
                <p className="text-xs text-[#77716A] mt-1">
                  Transfers are dispatched directly to your verified Bank Account or UPI VPA.
                </p>
              </div>
            </div>

            {withdrawError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="p-4 bg-[#324027]/10 border border-[#324027]/25 text-[#324027] text-xs font-semibold rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#324027] shrink-0 mt-0.5" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalRequest} className="space-y-6 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-700">
                    Withdrawal Amount (INR)
                  </label>
                  <span className="text-[11px] font-semibold text-[#324027]">
                    Max: ₹{(wallet.availableBalancePaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base font-bold text-neutral-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={wallet.availableBalancePaise / 100}
                    placeholder="Enter amount (e.g. 500)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-all rounded-xl text-base font-semibold text-brand-black"
                  />
                </div>

                {/* Quick amount chips */}
                {wallet.availableBalancePaise > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[100, 500, 1000, 2000].map((amt) => {
                      if (amt * 100 > wallet.availableBalancePaise) return null;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleQuickAmount(amt)}
                          className="px-3 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 transition-colors"
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handleQuickAmount(wallet.availableBalancePaise / 100)}
                      className="px-3 py-1 bg-[#324027]/10 hover:bg-[#324027]/20 border border-[#324027]/20 rounded-lg text-[11px] font-bold text-[#324027] transition-colors"
                    >
                      Full Balance (₹{(wallet.availableBalancePaise / 100).toFixed(2)})
                    </button>
                  </div>
                )}
              </div>

              {/* Destination method selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-700">
                    Select Payout Destination
                  </label>
                  {payoutMethods.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(true)}
                      className="text-[10px] uppercase tracking-wider font-bold text-[#324027] hover:underline"
                    >
                      + Add Another Destination
                    </button>
                  )}
                </div>

                {payoutMethods.length === 0 ? (
                  <div className="p-5 bg-white border border-dashed border-neutral-300 rounded-xl text-center space-y-2">
                    <p className="text-neutral-600 text-xs">
                      No payout destinations saved. Please add your UPI ID or Bank Account to receive funds.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(true)}
                      className="px-4 py-2 bg-[#324027] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#25301d] transition-colors inline-flex items-center gap-1.5"
                    >
                      + Add Payout Method
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payoutMethods.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setActiveMethodId(m.id)}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                          activeMethodId === m.id
                            ? "border-[#324027] bg-[#324027]/5 ring-1 ring-[#324027]"
                            : "border-brand-black/10 hover:border-brand-black/20 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`p-2.5 rounded-xl ${
                              m.type === "UPI" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {m.type === "UPI" ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-brand-black text-sm">
                                {m.type === "UPI" ? "UPI VPA" : "Direct Bank Transfer (IMPS)"}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                {m.type}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-600 font-mono block mt-0.5">
                              {m.type === "UPI"
                                ? m.upiId
                                : `A/C •••• ${m.bankAccountLast4 || m.accountNumber?.slice(-4)} (IFSC: ${m.ifsc})`}
                            </span>
                            <span className="text-[10px] text-neutral-400 block">Holder: {m.accountHolderName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isPending || deletingMethodId === m.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMethod(m.id);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded-md"
                            title="Remove payout method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <input
                            type="radio"
                            name="payout_destination"
                            checked={activeMethodId === m.id}
                            onChange={() => setActiveMethodId(m.id)}
                            className="accent-[#324027] w-4 h-4 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || payoutMethods.length === 0 || wallet.availableBalancePaise < 100}
                className="w-full py-4 tracking-widest font-bold uppercase text-xs text-white bg-[#324027] hover:bg-[#25301d] transition-all rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Withdraw Funds</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* B. Destination management Modal/Form */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-brand-black/10 pb-3">
              <h3 className="font-display text-xl text-brand-black">
                Manage Payout Destinations
              </h3>
              <button
                onClick={() => setIsAddOpen(!isAddOpen)}
                className="text-[11px] text-[#324027] font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
              >
                {isAddOpen ? "✕ Close Form" : "+ Add New Destination"}
              </button>
            </div>

            {isAddOpen && (
              <form
                onSubmit={handleAddPayoutMethod}
                className="bg-white border border-brand-black/15 p-6 sm:p-7 rounded-2xl space-y-5 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#324027] block">
                    Add Verified Payout Destination
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-brand-black">
                      <input
                        type="radio"
                        name="new_type"
                        checked={newMethodType === "UPI"}
                        onChange={() => setNewMethodType("UPI")}
                        className="accent-[#324027]"
                      />
                      UPI VPA
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-brand-black">
                      <input
                        type="radio"
                        name="new_type"
                        checked={newMethodType === "BANK"}
                        onChange={() => setNewMethodType("BANK")}
                        className="accent-[#324027]"
                      />
                      Bank Account
                    </label>
                  </div>
                </div>

                {addError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                <div className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                      Account Holder Name (as in Bank / UPI)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Satya Dev"
                      value={newHolderName}
                      onChange={(e) => setNewHolderName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black"
                    />
                  </div>

                  {newMethodType === "UPI" ? (
                    <div className="space-y-1">
                      <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                        UPI ID (Virtual Payment Address)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. satyadev@okhdfcbank or 9876543210@paytm"
                        value={newUpiId}
                        onChange={(e) => setNewUpiId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black font-mono"
                      />
                      <p className="text-[10px] text-neutral-400 pl-0.5">
                        Works with Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                            Bank Account Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 123456789012"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full px-4 py-3 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                            Confirm Account Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Re-enter account number"
                            value={newConfirmAccountNumber}
                            onChange={(e) => setNewConfirmAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full px-4 py-3 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                          Bank IFSC Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          placeholder="e.g. HDFC0001234, SBIN0001234"
                          value={newIfsc}
                          onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-white border border-brand-black/20 focus:border-[#324027] focus:ring-1 focus:ring-[#324027] focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black uppercase font-mono"
                        />
                        <p className="text-[10px] text-neutral-400 pl-0.5">
                          Found in your bank passbook, chequebook, or banking mobile app.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="w-1/3 py-3 text-xs font-bold uppercase tracking-wider rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isPending}
                    className="w-2/3 py-3 text-xs font-bold tracking-widest uppercase rounded-xl"
                  >
                    {isPending ? "Saving..." : "Verify & Save Destination"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Ledger Log and Status */}
        <div className="lg:col-span-5 space-y-10">
          {/* A. Transaction Logs */}
          <div className="bg-white border border-brand-black/10 p-6 sm:p-7 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-600 font-bold border-b border-brand-black/10 pb-4">
              Wallet Transaction History
            </h3>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-custom">
              {transactions.length === 0 ? (
                <p className="text-neutral-400 italic text-xs py-4 text-center">
                  No wallet transactions recorded yet.
                </p>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.amountPaise > 0;
                  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between border-b border-neutral-100 pb-3.5 last:border-none last:pb-0"
                    >
                      <div className="text-left font-sans text-xs max-w-[70%]">
                        <span className="font-semibold text-brand-black block leading-tight">
                          {tx.description}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-1">
                          {dateStr}
                        </span>
                      </div>
                      <span
                        className={`font-sans text-sm font-bold shrink-0 ${
                          isCredit ? "text-[#324027]" : "text-neutral-600"
                        }`}
                      >
                        {isCredit ? "+" : ""}₹{(Math.abs(tx.amountPaise) / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* B. Withdrawal Requests List */}
          <div className="bg-white border border-brand-black/10 p-6 sm:p-7 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-600 font-bold border-b border-brand-black/10 pb-4">
              Payout & Withdrawal Requests
            </h3>

            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-custom">
              {withdrawals.length === 0 ? (
                <p className="text-neutral-400 italic text-xs py-4 text-center">
                  No withdrawal requests submitted yet.
                </p>
              ) : (
                withdrawals.map((w) => {
                  const dateStr = new Date(w.requestedAt || w.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  let badgeColor = "bg-neutral-100 text-neutral-700 border-neutral-200";
                  let label = w.status;

                  if (w.status === "COMPLETED") {
                    badgeColor = "bg-[#324027]/10 text-[#324027] border-[#324027]/25";
                    label = "Paid to Bank/UPI";
                  } else if (w.status === "PROCESSING") {
                    badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                    label = "Processing Transfer";
                  } else if (w.status === "PENDING") {
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                    label = "Queued for Payout";
                  } else if (w.status === "FAILED" || w.status === "CANCELLED") {
                    badgeColor = "bg-red-50 text-red-700 border-red-200";
                    label = "Refunded to Wallet";
                  }

                  return (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl border border-neutral-100 hover:border-neutral-200 bg-[#FAF9F5] space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-bold text-brand-black">
                          ₹{(w.amountPaise / 100).toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold rounded-md px-2 py-0.5 border ${badgeColor}`}
                        >
                          {w.status === "PROCESSING" && <Clock className="w-2.5 h-2.5" />}
                          {w.status === "COMPLETED" && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {label}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-600 font-mono flex items-center justify-between">
                        <span>{w.destinationReference || `Destination: ${w.method || "Bank/UPI"}`}</span>
                        <span className="text-[10px] text-neutral-400 font-sans">{dateStr}</span>
                      </div>

                      {w.providerReferenceId && (
                        <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-200/50">
                          Ref: {w.providerReferenceId}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

