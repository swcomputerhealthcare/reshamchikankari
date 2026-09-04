'use client';

import React, { useState, useTransition } from "react";
import { addPayoutMethodAction, requestWithdrawalAction } from "@/actions/wallet";
import Button from "@/components/ui/button";
import { Landmark, Smartphone, ArrowRight, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";

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

export default function WalletClient({ wallet, transactions, payoutMethods: initialPayoutMethods, withdrawals: initialWithdrawals }: WalletClientProps) {
  const [payoutMethods, setPayoutMethods] = useState(initialPayoutMethods);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [isPending, startTransition] = useTransition();

  const [activeMethodId, setActiveMethodId] = useState(payoutMethods[0]?.id || "");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Form states for adding new payout method
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<"UPI" | "BANK">("UPI");
  const [newHolderName, setNewHolderName] = useState("");
  const [newUpiId, setNewUpiId] = useState("");
  const [newBankLast4, setNewBankLast4] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [addError, setAddError] = useState("");

  const handleAddPayoutMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!newHolderName.trim()) {
      setAddError("Account holder name is required.");
      return;
    }
    if (newMethodType === "UPI" && !newUpiId.trim()) {
      setAddError("UPI ID is required.");
      return;
    }
    if (newMethodType === "BANK" && (!newBankLast4.trim() || !newIfsc.trim())) {
      setAddError("Bank account last 4 digits and IFSC are required.");
      return;
    }

    startTransition(async () => {
      const res = await addPayoutMethodAction({
        type: newMethodType,
        accountHolderName: newHolderName,
        upiId: newMethodType === "UPI" ? newUpiId : undefined,
        bankAccountLast4: newMethodType === "BANK" ? newBankLast4 : undefined,
        ifsc: newMethodType === "BANK" ? newIfsc : undefined,
      });

      if (res.success) {
        setIsAddOpen(false);
        // Refresh local methods list
        const updatedMethods = [
          ...payoutMethods,
          res.payoutMethod || {
            id: `temp_${Date.now()}`,
            type: newMethodType,
            accountHolderName: newHolderName,
            upiId: newUpiId,
            bankAccountLast4: newBankLast4.slice(-4),
            ifsc: newIfsc,
            isVerified: true,
          },
        ];
        setPayoutMethods(updatedMethods);
        if (!activeMethodId) {
          setActiveMethodId(updatedMethods[0]?.id || "");
        }
        // Reset forms
        setNewHolderName("");
        setNewUpiId("");
        setNewBankLast4("");
        setNewIfsc("");
      } else {
        setAddError(res.error || "Failed to add payout method.");
      }
    });
  };

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess(false);

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
      setWithdrawError("Your available balance is ₹0. You need store credit balance to request a payout.");
      return;
    }
    if (amountPaise > wallet.availableBalancePaise) {
      setWithdrawError(`Cannot withdraw ₹${amountRupees.toFixed(2)}. Your available balance is ₹${(wallet.availableBalancePaise / 100).toFixed(2)}.`);
      return;
    }
    if (!activeMethodId) {
      setWithdrawError("Please select or add a verified payout destination below.");
      return;
    }

    startTransition(async () => {
      const res = await requestWithdrawalAction(amountPaise, activeMethodId);
      if (res.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount("");
        
        // Add to local list of withdrawals
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

  const totalBalancePaise = wallet.availableBalancePaise + wallet.lockedBalancePaise;

  return (
    <div className="space-y-12 font-sans text-left">
      {/* 1. Header Overview & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 space-y-4">
          <span className="text-[10px] tracking-widest uppercase font-bold text-[#324027] block pl-0.5">
            RC WALLET BALANCE
          </span>
          <h2 className="font-display text-5xl text-brand-black font-light leading-none">
            ₹{(totalBalancePaise / 100).toLocaleString("en-IN")}
          </h2>
          <p className="text-xs text-[#77716A] leading-relaxed max-w-xs">
            Use your available balance towards future purchases instantly during checkout, or request a withdrawal to your verified account.
          </p>
        </div>

        {/* Available to Spend/Withdraw card */}
        <div className="md:col-span-4 bg-white border border-[#324027]/15 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] tracking-wider uppercase font-bold text-neutral-400 block mb-1">
              Available to Spend & Withdraw
            </span>
            <span className="font-sans text-2xl font-bold text-[#324027]">
              ₹{(wallet.availableBalancePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-[10px] text-[#324027] flex items-center gap-1 font-bold pl-0.5 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#324027]" />
            100% Cash Withdrawable
          </div>
        </div>

        {/* Locked for processing card */}
        <div className="md:col-span-4 bg-white border border-brand-black/5 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-40">
          <div>
            <span className="text-[9px] tracking-wider uppercase font-bold text-neutral-400 block mb-1">
              Locked in Processing
            </span>
            <span className="font-sans text-2xl font-bold text-neutral-500">
              ₹{(wallet.lockedBalancePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium pl-0.5 uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
            In Payout Execution
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 pt-6 border-t border-brand-black/5">
        {/* Left Column: Withdrawal Form and Payout Management */}
        <div className="lg:col-span-7 space-y-10">
          {/* A. Withdrawal Form */}
          <div className="bg-[#F7F9F5] border border-[#324027]/15 p-6 sm:p-8 rounded-2xl space-y-6">
            <h3 className="font-display text-xl text-brand-black border-b border-[#324027]/10 pb-3">
              Request Payout / Withdrawal
            </h3>

            {withdrawError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                <span>⚠️ {withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-4 bg-[#324027]/10 border border-[#324027]/20 text-[#324027] text-xs font-semibold rounded-xl flex items-start gap-2">
                <span>✓ Payout requested successfully. Payout funds are locked in processing.</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalRequest} className="space-y-6 text-xs">
              <div className="space-y-2">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-600">
                  Withdrawal Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-sm font-semibold text-neutral-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Enter amount (e.g. ₹500)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 bg-white border border-[#324027]/20 focus:border-[#324027] focus:outline-none transition-colors rounded-xl text-sm font-semibold text-brand-black"
                  />
                </div>
              </div>

              {/* Destination method selector */}
              <div className="space-y-3">
                <label className="block uppercase tracking-widest text-[9px] font-bold text-neutral-600">
                  Select Payout Destination
                </label>

                {payoutMethods.length === 0 ? (
                  <p className="text-neutral-500 italic py-2 pl-0.5">
                    No verified payout destinations found. Add a UPI or Bank account below first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {payoutMethods.map((m) => (
                      <label
                        key={m.id}
                        onClick={() => setActiveMethodId(m.id)}
                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all select-none ${
                          activeMethodId === m.id
                            ? "border-[#324027] bg-[#324027]/5 ring-1 ring-[#324027]"
                            : "border-brand-black/10 hover:border-brand-black/20 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {m.type === "UPI" ? (
                            <Smartphone className="w-4 h-4 text-[#324027]" />
                          ) : (
                            <Landmark className="w-4 h-4 text-[#324027]" />
                          )}
                          <div>
                            <span className="font-semibold text-brand-black">
                              {m.type === "UPI" ? "UPI Payout" : "Bank Transfer"}
                            </span>
                            <span className="text-[10px] text-neutral-500 block mt-0.5">
                              {m.type === "UPI" ? m.upiId : `Acc •••• ${m.bankAccountLast4}`} ({m.accountHolderName})
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="payout_destination"
                          checked={activeMethodId === m.id}
                          onChange={() => setActiveMethodId(m.id)}
                          className="accent-[#324027] cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 tracking-widest font-bold uppercase text-xs text-white bg-[#324027] hover:bg-[#25301d] transition-all rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payout...</span>
                  </>
                ) : (
                  <>
                    <span>Request Withdrawal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* B. Destination management */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-brand-black/5 pb-3">
              <h3 className="font-display text-xl text-brand-black">
                Payout Destinations
              </h3>
              <button
                onClick={() => setIsAddOpen(!isAddOpen)}
                className="text-[10px] text-[#7C7A5A] font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
              >
                {isAddOpen ? "Close Form" : "[ Add Method ]"}
              </button>
            </div>

            {isAddOpen && (
              <form onSubmit={handleAddPayoutMethod} className="bg-white border border-brand-black/5 p-6 rounded-2xl space-y-4 text-xs">
                <span className="text-[10px] tracking-widest uppercase font-bold text-[#77716A] block pl-0.5 mb-2">
                  New Withdrawal Destination
                </span>

                {addError && (
                  <div className="p-3.5 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-xs font-semibold rounded-lg">
                    ⚠️ {addError}
                  </div>
                )}

                <div className="flex gap-4 border-b border-neutral-100 pb-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-brand-black">
                    <input
                      type="radio"
                      name="new_type"
                      checked={newMethodType === "UPI"}
                      onChange={() => setNewMethodType("UPI")}
                      className="accent-brand-black"
                    />
                    UPI Address
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-brand-black">
                    <input
                      type="radio"
                      name="new_type"
                      checked={newMethodType === "BANK"}
                      onChange={() => setNewMethodType("BANK")}
                      className="accent-brand-black"
                    />
                    Bank Account
                  </label>
                </div>

                <div className="space-y-3 font-sans">
                  <div className="space-y-1">
                    <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-400 pl-0.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Satya Dev"
                      value={newHolderName}
                      onChange={(e) => setNewHolderName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                    />
                  </div>

                  {newMethodType === "UPI" ? (
                    <div className="space-y-1">
                      <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-400 pl-0.5">
                        UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="satyadev@upi"
                        value={newUpiId}
                        onChange={(e) => setNewUpiId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-400 pl-0.5">
                          Account Last 4 Digits
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="e.g. 4821"
                          value={newBankLast4}
                          onChange={(e) => setNewBankLast4(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-400 pl-0.5">
                          Bank IFSC Code
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="HDFC0000123"
                          value={newIfsc}
                          onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2.5 bg-white border border-brand-black/10 focus:border-brand-black focus:outline-hidden transition-colors rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isPending}
                  className="w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg"
                >
                  Verify & Save Destination
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Ledger Log and Status */}
        <div className="lg:col-span-5 space-y-10">
          {/* A. Transaction Logs */}
          <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold border-b border-brand-black/5 pb-4 pl-0.5">
              Wallet Transaction History
            </h3>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-custom">
              {transactions.length === 0 ? (
                <p className="text-neutral-400 italic text-xs py-4 pl-0.5">
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
                    <div key={tx.id} className="flex items-center justify-between border-b border-neutral-50 pb-4 last:border-none last:pb-0">
                      <div className="text-left font-sans text-xs">
                        <span className="font-semibold text-brand-black block">
                          {tx.description}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {dateStr}
                        </span>
                      </div>
                      <span className={`font-sans text-sm font-bold ${isCredit ? "text-[#7C7A5A]" : "text-neutral-500"}`}>
                        {isCredit ? "+" : ""}₹{(tx.amountPaise / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* B. Withdrawal Requests List */}
          <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold border-b border-brand-black/5 pb-4 pl-0.5">
              Withdrawal Requests
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-custom">
              {withdrawals.length === 0 ? (
                <p className="text-neutral-400 italic text-xs py-4 pl-0.5">
                  No withdrawal requests submitted yet.
                </p>
              ) : (
                withdrawals.map((w) => {
                  const dateStr = new Date(w.requestedAt || w.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  let statusBg = "bg-neutral-100 text-neutral-600";
                  if (w.status === "COMPLETED") statusBg = "bg-[#7C7A5A]/10 text-[#7C7A5A]";
                  if (w.status === "FAILED" || w.status === "CANCELLED") statusBg = "bg-red-50 text-red-600";

                  return (
                    <div key={w.id} className="flex items-center justify-between border-b border-neutral-50 pb-4 last:border-none last:pb-0">
                      <div className="text-left font-sans text-xs">
                        <span className="font-semibold text-brand-black block">
                          Payout Request
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {dateStr}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-sans text-xs font-bold text-brand-black block">
                          ₹{(w.amountPaise / 100).toLocaleString("en-IN")}
                        </span>
                        <span className={`inline-block text-[8px] uppercase tracking-wider font-bold rounded-full px-2 py-0.5 mt-1 ${statusBg}`}>
                          {w.status}
                        </span>
                      </div>
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
