'use client';

import React, { useState, useTransition } from "react";
import {
  adminApproveWithdrawalAction,
  adminRejectWithdrawalAction,
  adminExecuteRazorpayPayoutAction,
  adminCreditWalletAction,
} from "@/actions/wallet";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Search,
  ExternalLink,
  PlusCircle,
  Loader2,
  Landmark,
  Smartphone,
  XCircle,
  IndianRupee,
} from "lucide-react";

interface AdminWalletControllerProps {
  initialWithdrawals: any[];
}

export default function AdminWalletController({ initialWithdrawals }: AdminWalletControllerProps) {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [isPending, startTransition] = useTransition();

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Approval Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [targetWithdrawalId, setTargetWithdrawalId] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState("");

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Issue Credit Form State
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditMsg, setCreditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Mark as Completed / Enter UTR
  const openApproveModal = (id: string) => {
    setTargetWithdrawalId(id);
    setUtrInput("");
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!targetWithdrawalId) return;
    const utr = utrInput.trim();

    startTransition(async () => {
      const res = await adminApproveWithdrawalAction(targetWithdrawalId, utr || undefined);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === targetWithdrawalId
              ? {
                  ...w,
                  status: "COMPLETED",
                  providerReferenceId: res.referenceId || utr || "MANUAL_PAID",
                  completedAt: new Date().toISOString(),
                }
              : w
          )
        );
        setApproveModalOpen(false);
        setTargetWithdrawalId(null);
      } else {
        alert(res.error || "Failed to approve withdrawal.");
      }
    });
  };

  // 2. Reject Withdrawal
  const openRejectModal = (id: string) => {
    setTargetWithdrawalId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!targetWithdrawalId) return;
    const reason = rejectReason.trim() || "Rejected by administrator";

    startTransition(async () => {
      const res = await adminRejectWithdrawalAction(targetWithdrawalId, reason);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === targetWithdrawalId
              ? {
                  ...w,
                  status: "FAILED",
                  failureMessage: reason,
                  failedAt: new Date().toISOString(),
                }
              : w
          )
        );
        setRejectModalOpen(false);
        setTargetWithdrawalId(null);
      } else {
        alert(res.error || "Failed to reject withdrawal.");
      }
    });
  };

  // 3. Dispatch via RazorpayX
  const handleAutoPayout = (id: string) => {
    if (!confirm("Dispatch automated payout via RazorpayX to this destination now?")) return;

    startTransition(async () => {
      const res = await adminExecuteRazorpayPayoutAction(id);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status: res.status === "processed" || res.status === "completed" ? "COMPLETED" : "PROCESSING",
                  provider: "RAZORPAY",
                  providerReferenceId: res.payoutId || w.providerReferenceId,
                }
              : w
          )
        );
        alert(`RazorpayX payout initiated! Payout ID: ${res.payoutId || "Queued"}`);
      } else {
        alert(res.error || "Failed to execute RazorpayX payout.");
      }
    });
  };

  // 4. Issue Wallet Credit
  const handleIssueCredit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditMsg(null);

    const email = creditEmail.trim();
    const rupees = parseFloat(creditAmount);
    const reason = creditReason.trim() || "Admin goodwill credit";

    if (!email || !email.includes("@")) {
      setCreditMsg({ type: "error", text: "Please enter a valid customer email." });
      return;
    }
    if (isNaN(rupees) || rupees <= 0) {
      setCreditMsg({ type: "error", text: "Please enter a valid positive amount." });
      return;
    }

    const amountPaise = Math.round(rupees * 100);

    startTransition(async () => {
      const res = await adminCreditWalletAction(email, amountPaise, reason);
      if (res.success) {
        setCreditMsg({
          type: "success",
          text: res.message || `Successfully credited ₹${rupees.toLocaleString("en-IN")} to ${email}`,
        });
        setCreditEmail("");
        setCreditAmount("");
        setCreditReason("");
      } else {
        setCreditMsg({ type: "error", text: res.error || "Failed to credit customer wallet." });
      }
    });
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    // Status filter
    if (filterStatus === "PENDING" && !(w.status === "PENDING" || w.status === "PROCESSING")) return false;
    if (filterStatus === "COMPLETED" && w.status !== "COMPLETED") return false;
    if (filterStatus === "FAILED" && !(w.status === "FAILED" || w.status === "CANCELLED")) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = w.user?.email?.toLowerCase().includes(q);
      const matchName = w.user?.name?.toLowerCase().includes(q);
      const matchDest = w.destinationReference?.toLowerCase().includes(q);
      const matchId = w.id?.toLowerCase().includes(q);
      const matchRef = w.providerReferenceId?.toLowerCase().includes(q);
      const matchHolder = w.payoutMethod?.accountHolderName?.toLowerCase().includes(q);
      const matchUpi = w.payoutMethod?.upiId?.toLowerCase().includes(q);
      const matchAcc = (w.payoutMethod?.accountNumber || w.metadata?.accountNumber)?.toLowerCase().includes(q);

      return matchEmail || matchName || matchDest || matchId || matchRef || matchHolder || matchUpi || matchAcc;
    }
    return true;
  });

  // Analytics
  const pendingCount = withdrawals.filter((w) => w.status === "PENDING" || w.status === "PROCESSING").length;
  const pendingPaise = withdrawals
    .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
    .reduce((sum, w) => sum + (w.amountPaise || 0), 0);

  const completedCount = withdrawals.filter((w) => w.status === "COMPLETED").length;
  const completedPaise = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((sum, w) => sum + (w.amountPaise || 0), 0);

  return (
    <div className="space-y-8 font-sans text-left">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-brand-black/10 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block mb-1">
              Pending Payout Requests
            </span>
            <div className="text-3xl font-display text-brand-black font-semibold">
              ₹{(pendingPaise / 100).toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              {pendingCount} request{pendingCount === 1 ? "" : "s"} awaiting payout
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-brand-black/10 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#324027] block mb-1">
              Completed Transfers
            </span>
            <div className="text-3xl font-display text-brand-black font-semibold">
              ₹{(completedPaise / 100).toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              {completedCount} withdrawal{completedCount === 1 ? "" : "s"} fulfilled
            </span>
          </div>
          <div className="p-3 bg-[#324027]/10 rounded-2xl text-[#324027]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-brand-black/10 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block mb-1">
              Total Recorded Requests
            </span>
            <div className="text-3xl font-display text-brand-black font-semibold">
              {withdrawals.length}
            </div>
            <span className="text-xs text-neutral-500 mt-1 block">
              All-time wallet withdrawals
            </span>
          </div>
          <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Main Section: Table and Issue Credit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Withdrawal Requests Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-brand-black/10 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Header, Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="font-display text-xl text-brand-black font-medium">
                  Withdrawal Requests
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review customer payout destinations (UPI / Bank Account) and execute payments.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-neutral-100 p-1 rounded-xl text-[11px] font-semibold">
                {[
                  { key: "ALL", label: "All" },
                  { key: "PENDING", label: `Pending (${pendingCount})` },
                  { key: "COMPLETED", label: "Completed" },
                  { key: "FAILED", label: "Failed" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filterStatus === tab.key
                        ? "bg-white text-brand-black shadow-xs font-bold"
                        : "text-neutral-500 hover:text-brand-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by customer email, name, UPI ID, or account number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none transition-colors rounded-xl text-xs"
              />
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredWithdrawals.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs italic">
                  No withdrawal requests found matching your filter.
                </div>
              ) : (
                filteredWithdrawals.map((req) => {
                  const isPendingStatus = req.status === "PENDING" || req.status === "PROCESSING";
                  const isCompleted = req.status === "COMPLETED";
                  const isFailed = req.status === "FAILED" || req.status === "CANCELLED";

                  const dateStr = new Date(req.requestedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  // Retrieve full destination info from metadata or joined payoutMethod
                  const methodType = req.method || req.payoutMethod?.type || req.metadata?.type || "UPI";
                  const isUpi = methodType === "UPI";
                  const upiId = req.payoutMethod?.upiId || req.metadata?.upiId || "";
                  const fullAcc = req.payoutMethod?.accountNumber || req.metadata?.accountNumber || "";
                  const ifsc = req.payoutMethod?.ifsc || req.metadata?.ifsc || "";
                  const holderName =
                    req.payoutMethod?.accountHolderName ||
                    req.metadata?.accountHolderName ||
                    req.user?.name ||
                    "Customer";

                  let statusBadge = "bg-neutral-100 text-neutral-600 border-neutral-200";
                  if (isCompleted) statusBadge = "bg-[#324027]/10 text-[#324027] border-[#324027]/25";
                  if (isPendingStatus) statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                  if (isFailed) statusBadge = "bg-red-50 text-red-600 border-red-200";

                  return (
                    <div
                      key={req.id}
                      className="p-5 border border-brand-black/10 rounded-2xl bg-[#FAF9F5] hover:border-brand-black/25 transition-all space-y-4 shadow-xs"
                    >
                      {/* Top row: Amount & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-display text-2xl font-bold text-brand-black">
                            ₹{(req.amountPaise / 100).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold rounded-md px-2 py-0.5 border ${statusBadge}`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500">{dateStr}</span>
                      </div>

                      {/* Middle row: User & Destination Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Customer details */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                            Requested By
                          </span>
                          <div className="font-semibold text-brand-black">{req.user?.name || "Customer"}</div>
                          <div className="text-neutral-600 font-mono">{req.user?.email}</div>
                          {req.user?.phone && <div className="text-neutral-500">{req.user.phone}</div>}
                        </div>

                        {/* Destination details with one-click copy buttons */}
                        <div className="space-y-1 bg-white p-3 rounded-xl border border-neutral-200/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                              {isUpi ? <Smartphone className="w-3.5 h-3.5 text-purple-600" /> : <Landmark className="w-3.5 h-3.5 text-blue-600" />}
                              Payout Destination ({methodType})
                            </span>
                          </div>

                          <div className="font-semibold text-brand-black mt-1">Holder: {holderName}</div>

                          {isUpi ? (
                            <div className="flex items-center justify-between gap-2 pt-1 font-mono text-purple-800">
                              <span className="truncate">{upiId || "UPI ID unavailable"}</span>
                              {upiId && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(upiId, `upi_${req.id}`)}
                                  className="p-1 text-neutral-400 hover:text-brand-black transition-colors shrink-0"
                                  title="Copy UPI ID"
                                >
                                  {copiedKey === `upi_${req.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5 pt-1 text-[11px] font-mono text-blue-900">
                              <div className="flex items-center justify-between gap-2">
                                <span>A/C: {fullAcc || `•••• ${req.payoutMethod?.bankAccountLast4 || "####"}`}</span>
                                {fullAcc && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(fullAcc, `acc_${req.id}`)}
                                    className="p-1 text-neutral-400 hover:text-brand-black transition-colors shrink-0"
                                    title="Copy Account Number"
                                  >
                                    {copiedKey === `acc_${req.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-2 text-neutral-600">
                                <span>IFSC: {ifsc || "N/A"}</span>
                                {ifsc && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(ifsc, `ifsc_${req.id}`)}
                                    className="p-1 text-neutral-400 hover:text-brand-black transition-colors shrink-0"
                                    title="Copy IFSC"
                                  >
                                    {copiedKey === `ifsc_${req.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reference & Failure message */}
                      {req.providerReferenceId && (
                        <div className="text-[11px] font-mono text-neutral-500 bg-neutral-100/80 px-3 py-1.5 rounded-lg flex items-center justify-between">
                          <span>Reference / UTR: {req.providerReferenceId}</span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">{req.provider || "MANUAL"}</span>
                        </div>
                      )}

                      {req.failureMessage && (
                        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Note: {req.failureMessage}</span>
                        </div>
                      )}

                      {/* Actions for PENDING / PROCESSING requests */}
                      {isPendingStatus && (
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-200/50">
                          {/* 1. Mark as Paid (Enter UTR) */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => openApproveModal(req.id)}
                            className="px-4 py-2 bg-[#324027] hover:bg-[#25301d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Paid (Enter UTR)</span>
                          </button>

                          {/* 2. Automated RazorpayX dispatch */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleAutoPayout(req.id)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Execute transfer using RazorpayX Payout API"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Pay via RazorpayX</span>
                          </button>

                          {/* 3. Reject & Refund */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => openRejectModal(req.id)}
                            className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Wallet Credit Tool (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-brand-black/10 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-[#324027] block mb-1">
                WALLET ADJUSTMENT
              </span>
              <h3 className="font-display text-xl text-brand-black font-semibold">
                Issue Store Credit
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Credit funds to a customer's RC Wallet for returns, goodwill, or order compensations.
              </p>
            </div>

            {creditMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                  creditMsg.type === "success"
                    ? "bg-[#324027]/10 border border-[#324027]/25 text-[#324027]"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {creditMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{creditMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleIssueCredit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                  Customer Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={creditEmail}
                  onChange={(e) => setCreditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none transition-colors rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                  Amount in Rupees (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 500"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none transition-colors rounded-xl text-xs font-semibold text-brand-black"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                  Reason / Ledger Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refund for returned Chikankari Kurta"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none transition-colors rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-[#324027] hover:bg-[#25301d] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Credit...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Credit Customer Wallet</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Approve / Enter UTR Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl text-xs">
            <div>
              <h3 className="font-display text-xl text-brand-black font-semibold">
                Confirm Payout Transfer
              </h3>
              <p className="text-neutral-500 mt-1">
                Enter the Bank Transfer UTR or UPI Transaction Reference ID to mark this payout as completed.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                Bank UTR / UPI Reference Number
              </label>
              <input
                type="text"
                placeholder="e.g. UTR1239849202 or UPI4829104820"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full px-4 py-3 border border-brand-black/20 focus:border-brand-black focus:outline-none transition-colors rounded-xl font-mono text-xs font-semibold"
              />
              <p className="text-[10px] text-neutral-400 pl-0.5">
                Optional: If left blank, a system confirmation ID will be assigned.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="w-1/2 py-2.5 border border-neutral-300 rounded-xl font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmApprove}
                className="w-1/2 py-2.5 bg-[#324027] hover:bg-[#25301d] text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isPending ? "Confirming..." : "Confirm Paid"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl text-xs">
            <div>
              <h3 className="font-display text-xl text-red-700 font-semibold">
                Reject Withdrawal Request
              </h3>
              <p className="text-neutral-500 mt-1">
                Rejecting this request will immediately release and restore the locked funds back into the customer's RC Wallet.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="uppercase tracking-widest text-[9px] font-bold text-neutral-600 pl-0.5">
                Rejection Reason (visible to customer)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Incorrect bank account number or IFSC code. Please update and re-submit."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-brand-black/20 focus:border-brand-black focus:outline-none transition-colors rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="w-1/2 py-2.5 border border-neutral-300 rounded-xl font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmReject}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isPending ? "Rejecting..." : "Reject & Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
