'use client';

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createCouponAction,
  generatePrivateCouponAction,
  updateCouponAction,
  toggleCouponStatusAction,
  revokeCouponAction,
  deleteCouponAction,
} from "@/actions/coupon";
import {
  Plus,
  Search,
  Ticket,
  Percent,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  X,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Lock,
  UserCheck,
  Layers,
  KeyRound,
} from "lucide-react";

export interface CouponItem {
  id: string;
  code: string;
  codeHash?: string | null;
  codeMasked?: string | null;
  codeSuffix?: string | null;
  description?: string | null;
  type: string;
  value: number;
  minimumOrderPaise: number;
  maximumDiscountPaise?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit: number;
  isPrivate?: boolean;
  isSingleUse?: boolean;
  assignedUserId?: string | null;
  assignedEmail?: string | null;
  canStackWithCampaigns?: boolean;
  internalReason?: string | null;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  isActive: boolean;
  revokedAt?: Date | string | null;
  revokedBy?: string | null;
  createdAt?: Date | string;
}

interface CouponListControllerProps {
  initialCoupons: CouponItem[];
}

export default function CouponListController({ initialCoupons }: CouponListControllerProps) {
  const router = useRouter();
  const [couponsList, setCouponsList] = useState<CouponItem[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "REVOKED">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PRIVATE" | "PUBLIC">("ALL");
  const [isPending, startTransition] = useTransition();

  // Toast
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);
  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  // One-time code revelation dialog
  const [revealedCodeData, setRevealedCodeData] = useState<{
    code: string;
    masked: string;
    description: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Private Coupon Form Fields
  const [privateDescription, setPrivateDescription] = useState("");
  const [privateInternalReason, setPrivateInternalReason] = useState("");
  const [privateDiscountType, setPrivateDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [privateDiscountValue, setPrivateDiscountValue] = useState("");
  const [privateMinOrderRupees, setPrivateMinOrderRupees] = useState("");
  const [privateMaxDiscountRupees, setPrivateMaxDiscountRupees] = useState("");
  const [privateIsSingleUse, setPrivateIsSingleUse] = useState(true);
  const [privateAssignedEmail, setPrivateAssignedEmail] = useState("");
  const [privateCanStack, setPrivateCanStack] = useState(false);
  const [privateExpirationDate, setPrivateExpirationDate] = useState("");

  // Public Coupon Form Fields
  const [publicCode, setPublicCode] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  const [publicDiscountType, setPublicDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [publicDiscountValue, setPublicDiscountValue] = useState("");
  const [publicMinOrderRupees, setPublicMinOrderRupees] = useState("");
  const [publicMaxDiscountRupees, setPublicMaxDiscountRupees] = useState("");
  const [publicUsageLimit, setPublicUsageLimit] = useState("");
  const [publicPerUserLimit, setPublicPerUserLimit] = useState("1");
  const [publicCanStack, setPublicCanStack] = useState(true);
  const [publicExpirationDate, setPublicExpirationDate] = useState("");
  const [publicIsActive, setPublicIsActive] = useState(true);

  const resetPrivateForm = () => {
    setPrivateDescription("");
    setPrivateInternalReason("");
    setPrivateDiscountType("PERCENTAGE");
    setPrivateDiscountValue("");
    setPrivateMinOrderRupees("");
    setPrivateMaxDiscountRupees("");
    setPrivateIsSingleUse(true);
    setPrivateAssignedEmail("");
    setPrivateCanStack(false);
    setPrivateExpirationDate("");
  };

  const resetPublicForm = () => {
    setPublicCode("");
    setPublicDescription("");
    setPublicDiscountType("PERCENTAGE");
    setPublicDiscountValue("");
    setPublicMinOrderRupees("");
    setPublicMaxDiscountRupees("");
    setPublicUsageLimit("");
    setPublicPerUserLimit("1");
    setPublicCanStack(true);
    setPublicExpirationDate("");
    setPublicIsActive(true);
    setEditingCoupon(null);
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return couponsList.filter((c) => {
      const q = search.toLowerCase();
      const codeMatches = (c.code || "").toLowerCase().includes(q);
      const maskedMatches = (c.codeMasked || "").toLowerCase().includes(q);
      const suffixMatches = (c.codeSuffix || "").toLowerCase().includes(q);
      const descMatches = (c.description || "").toLowerCase().includes(q);
      const reasonMatches = (c.internalReason || "").toLowerCase().includes(q);
      const matchesSearch = codeMatches || maskedMatches || suffixMatches || descMatches || reasonMatches;

      const isRevoked = Boolean(c.revokedAt);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "REVOKED" && isRevoked) ||
        (statusFilter === "ACTIVE" && c.isActive && !isRevoked) ||
        (statusFilter === "INACTIVE" && (!c.isActive || isRevoked));

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "PRIVATE" && c.isPrivate) ||
        (typeFilter === "PUBLIC" && !c.isPrivate);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [couponsList, search, statusFilter, typeFilter]);

  const handleCopyCode = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
      showToast("Coupon code copied to clipboard!");
    } catch {
      showToast("Please copy the code manually.", true);
    }
  };

  const handleGeneratePrivateCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!privateDescription.trim()) {
      showToast("Internal name or recipient description is required.", true);
      return;
    }
    if (!privateInternalReason.trim()) {
      showToast("Internal audit reason is required.", true);
      return;
    }

    const valNum = parseFloat(privateDiscountValue);
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Please enter a valid positive discount value.", true);
      return;
    }

    if (privateDiscountType === "PERCENTAGE" && valNum > 90) {
      showToast("Percentage discount cannot exceed 90%.", true);
      return;
    }

    const minOrderVal = parseFloat(privateMinOrderRupees) || 0;
    const maxDiscountVal = privateMaxDiscountRupees ? parseFloat(privateMaxDiscountRupees) : null;

    const storageValue =
      privateDiscountType === "PERCENTAGE" ? Math.round(valNum) : Math.round(valNum * 100);
    const minOrderPaise = Math.round(minOrderVal * 100);
    const maxDiscountPaise = maxDiscountVal ? Math.round(maxDiscountVal * 100) : null;

    startTransition(async () => {
      const res = await generatePrivateCouponAction({
        description: privateDescription.trim(),
        discountType: privateDiscountType,
        discountValue: storageValue,
        minOrderValuePaise: minOrderPaise,
        maxDiscountValuePaise: maxDiscountPaise,
        isSingleUse: privateIsSingleUse,
        usageLimit: privateIsSingleUse ? 1 : 1,
        perUserLimit: 1,
        assignedEmail: privateAssignedEmail.trim() || null,
        canStackWithCampaigns: privateCanStack,
        internalReason: privateInternalReason.trim(),
        expirationDate: privateExpirationDate || null,
      });

      if (res.success && res.id && res.generatedCode) {
        setIsPrivateModalOpen(false);
        resetPrivateForm();
        setRevealedCodeData({
          code: res.generatedCode,
          masked: res.codeMasked || res.generatedCode,
          description: privateDescription,
        });

        // Add to local state with masked format
        const newRecord: CouponItem = {
          id: res.id,
          code: res.generatedCode,
          codeMasked: res.codeMasked,
          codeSuffix: res.codeSuffix,
          description: privateDescription,
          type: privateDiscountType,
          value: storageValue,
          minimumOrderPaise: minOrderPaise,
          maximumDiscountPaise: maxDiscountPaise,
          usageLimit: privateIsSingleUse ? 1 : 1,
          usageCount: 0,
          perUserLimit: 1,
          isPrivate: true,
          isSingleUse: privateIsSingleUse,
          assignedEmail: privateAssignedEmail.trim() || null,
          canStackWithCampaigns: privateCanStack,
          internalReason: privateInternalReason.trim(),
          expiresAt: privateExpirationDate ? new Date(privateExpirationDate) : null,
          isActive: true,
          createdAt: new Date(),
        };

        setCouponsList((prev) => [newRecord, ...prev]);
        router.refresh();
      } else {
        showToast(res.error || "Failed to generate private coupon.", true);
      }
    });
  };

  const handleRevokeCoupon = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await revokeCouponAction(id, revokeReason || undefined);
      if (res.success) {
        showToast("Coupon revoked successfully.");
        setCouponsList((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  isActive: false,
                  revokedAt: new Date(),
                  internalReason: `${c.internalReason || ""} [REVOKED: ${revokeReason || "Admin Revocation"}]`,
                }
              : c
          )
        );
        setRevokeConfirmId(null);
        setRevokeReason("");
        router.refresh();
      } else {
        showToast(res.error || "Failed to revoke coupon.", true);
        setRevokeConfirmId(null);
      }
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    if (isPending) return;
    const nextActive = !currentActive;

    setCouponsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: nextActive } : c))
    );

    startTransition(async () => {
      const res = await toggleCouponStatusAction(id, nextActive);
      if (res.success) {
        showToast(nextActive ? "Coupon activated." : "Coupon deactivated.");
        router.refresh();
      } else {
        showToast(res.error || "Failed to update status.", true);
        setCouponsList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: currentActive } : c))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await deleteCouponAction(id);
      if (res.success) {
        showToast("Coupon deleted successfully.");
        setCouponsList((prev) => prev.filter((c) => c.id !== id));
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to delete coupon.", true);
        setDeleteConfirmId(null);
      }
    });
  };

  const handlePublicSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicCode.trim()) {
      showToast("Coupon code is required.", true);
      return;
    }

    const valNum = parseFloat(publicDiscountValue);
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Please enter a valid positive discount value.", true);
      return;
    }

    const minOrderVal = parseFloat(publicMinOrderRupees) || 0;
    const maxDiscountVal = publicMaxDiscountRupees ? parseFloat(publicMaxDiscountRupees) : null;
    const usageLimitVal = publicUsageLimit ? parseInt(publicUsageLimit, 10) : null;
    const perUserVal = parseInt(publicPerUserLimit, 10) || 1;

    const storageValue =
      publicDiscountType === "PERCENTAGE" ? Math.round(valNum) : Math.round(valNum * 100);
    const minOrderPaise = Math.round(minOrderVal * 100);
    const maxDiscountPaise = maxDiscountVal ? Math.round(maxDiscountVal * 100) : null;

    startTransition(async () => {
      if (editingCoupon) {
        const res = await updateCouponAction(editingCoupon.id, {
          code: publicCode.trim().toUpperCase(),
          description: publicDescription.trim() || undefined,
          discountType: publicDiscountType,
          discountValue: storageValue,
          minOrderValuePaise: minOrderPaise,
          maxDiscountValuePaise: maxDiscountPaise,
          usageLimit: usageLimitVal,
          perUserLimit: perUserVal,
          canStackWithCampaigns: publicCanStack,
          expirationDate: publicExpirationDate || null,
          isActive: publicIsActive,
        });

        if (res.success) {
          showToast(`Coupon '${publicCode.trim().toUpperCase()}' updated.`);
          setCouponsList((prev) =>
            prev.map((c) =>
              c.id === editingCoupon.id
                ? {
                    ...c,
                    code: publicCode.trim().toUpperCase(),
                    codeMasked: publicCode.trim().toUpperCase(),
                    description: publicDescription,
                    type: publicDiscountType,
                    value: storageValue,
                    minimumOrderPaise: minOrderPaise,
                    maximumDiscountPaise: maxDiscountPaise,
                    usageLimit: usageLimitVal,
                    perUserLimit: perUserVal,
                    canStackWithCampaigns: publicCanStack,
                    expiresAt: publicExpirationDate ? new Date(publicExpirationDate) : null,
                    isActive: publicIsActive,
                  }
                : c
            )
          );
          setIsPublicModalOpen(false);
          resetPublicForm();
          router.refresh();
        } else {
          showToast(res.error || "Failed to update coupon.", true);
        }
      } else {
        const res = await createCouponAction({
          code: publicCode.trim().toUpperCase(),
          description: publicDescription.trim() || undefined,
          discountType: publicDiscountType,
          discountValue: storageValue,
          minOrderValuePaise: minOrderPaise,
          maxDiscountValuePaise: maxDiscountPaise,
          usageLimit: usageLimitVal,
          perUserLimit: perUserVal,
          canStackWithCampaigns: publicCanStack,
          expirationDate: publicExpirationDate || null,
          isActive: publicIsActive,
        });

        if (res.success && res.id) {
          showToast(`Coupon '${publicCode.trim().toUpperCase()}' created.`);
          setCouponsList((prev) => [
            {
              id: res.id!,
              code: publicCode.trim().toUpperCase(),
              codeMasked: publicCode.trim().toUpperCase(),
              description: publicDescription,
              type: publicDiscountType,
              value: storageValue,
              minimumOrderPaise: minOrderPaise,
              maximumDiscountPaise: maxDiscountPaise,
              usageLimit: usageLimitVal,
              usageCount: 0,
              perUserLimit: perUserVal,
              isPrivate: false,
              isSingleUse: false,
              canStackWithCampaigns: publicCanStack,
              expiresAt: publicExpirationDate ? new Date(publicExpirationDate) : null,
              isActive: publicIsActive,
              createdAt: new Date(),
            },
            ...prev,
          ]);
          setIsPublicModalOpen(false);
          resetPublicForm();
          router.refresh();
        } else {
          showToast(res.error || "Failed to create coupon.", true);
        }
      }
    });
  };

  const openEditPublicModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setPublicCode(c.code);
    setPublicDescription(c.description || "");
    setPublicDiscountType(c.type === "FIXED" || c.type === "FIXED_AMOUNT" ? "FIXED" : "PERCENTAGE");
    setPublicDiscountValue(
      c.type === "PERCENTAGE" ? c.value.toString() : (c.value / 100).toString()
    );
    setPublicMinOrderRupees((c.minimumOrderPaise / 100).toString());
    setPublicMaxDiscountRupees(c.maximumDiscountPaise ? (c.maximumDiscountPaise / 100).toString() : "");
    setPublicUsageLimit(c.usageLimit?.toString() || "");
    setPublicPerUserLimit(c.perUserLimit?.toString() || "1");
    setPublicCanStack(c.canStackWithCampaigns ?? true);
    setPublicExpirationDate(c.expiresAt ? new Date(c.expiresAt).toISOString().split("T")[0] : "");
    setPublicIsActive(c.isActive);
    setIsPublicModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
            toast.isError
              ? "bg-rose-900 text-rose-100 border border-rose-700"
              : "bg-emerald-950 text-emerald-100 border border-emerald-700"
          }`}
        >
          {toast.isError ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search code, suffix, description, recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-hidden focus:border-neutral-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="REVOKED">Revoked Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:outline-hidden focus:border-neutral-900"
          >
            <option value="ALL">All Coupon Types</option>
            <option value="PRIVATE">Private / Special-Use</option>
            <option value="PUBLIC">Public Campaigns</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Primary: Generate Private Coupon */}
          <button
            onClick={() => {
              resetPrivateForm();
              setIsPrivateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Generate Private Coupon</span>
          </button>

          {/* Secondary: Create Public Campaign Coupon */}
          <button
            onClick={() => {
              resetPublicForm();
              setIsPublicModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Public Offer</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Coupon Code & Details</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Restrictions & Stacking</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Ticket className="w-8 h-8 mx-auto mb-2 text-neutral-300 stroke-[1.5]" />
                    <p className="text-xs">No coupons found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isRevoked = Boolean(c.revokedAt);
                  const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  const isMaxed = c.usageLimit && c.usageCount >= c.usageLimit;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isRevoked ? "bg-neutral-50/50 opacity-75" : ""
                      }`}
                    >
                      {/* Code & Details */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold tracking-wider text-neutral-900">
                              {c.codeMasked || c.code}
                            </span>
                            {c.isPrivate ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                                <Lock className="w-2.5 h-2.5" />
                                PRIVATE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-neutral-100 text-neutral-700">
                                PUBLIC
                              </span>
                            )}
                            {c.isSingleUse && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                1-USE
                              </span>
                            )}
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-neutral-600 font-medium">
                              {c.description}
                            </p>
                          )}
                          {c.internalReason && (
                            <p className="text-[10px] text-neutral-400 italic">
                              Reason: {c.internalReason}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-800">
                          {c.type === "PERCENTAGE" ? (
                            <span className="text-emerald-700 font-bold">{c.value}% OFF</span>
                          ) : (
                            <span className="text-emerald-700 font-bold">
                              ₹{(c.value / 100).toLocaleString("en-IN")} OFF
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 space-y-0.5 mt-0.5">
                          {c.minimumOrderPaise > 0 && (
                            <p>Min order: ₹{(c.minimumOrderPaise / 100).toLocaleString("en-IN")}</p>
                          )}
                          {c.maximumDiscountPaise && (
                            <p>Max cap: ₹{(c.maximumDiscountPaise / 100).toLocaleString("en-IN")}</p>
                          )}
                        </div>
                      </td>

                      {/* Redemptions */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono text-neutral-700">
                          {c.usageCount} / {c.usageLimit ? c.usageLimit : "∞"}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {c.perUserLimit === 1 ? "1 per patron" : `${c.perUserLimit} max / patron`}
                        </div>
                      </td>

                      {/* Restrictions & Stacking */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[11px]">
                          {c.assignedEmail ? (
                            <div className="flex items-center gap-1.5 text-neutral-700">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-mono truncate max-w-[150px]">{c.assignedEmail}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[10px]">Open to all patrons</span>
                          )}

                          <div>
                            {c.canStackWithCampaigns ? (
                              <span className="inline-block text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Stacks with Navratri
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                                No Sale Stacking
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-3 h-3" />
                            REVOKED
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            EXPIRED
                          </span>
                        ) : isMaxed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            REDEEMED
                          </span>
                        ) : c.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600">
                            INACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Revoke Action for active private coupons */}
                          {!isRevoked && c.code !== "WELCOME10" && (
                            <button
                              onClick={() => {
                                setRevokeConfirmId(c.id);
                                setRevokeReason("");
                              }}
                              title="Revoke Coupon"
                              className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 text-neutral-500 hover:text-rose-700 transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Toggle Active status */}
                          {!isRevoked && (
                            <button
                              onClick={() => handleToggle(c.id, c.isActive)}
                              title={c.isActive ? "Deactivate" : "Activate"}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                c.isActive
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                              }`}
                            >
                              {c.isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Edit (for public coupons) */}
                          {!c.isPrivate && (
                            <button
                              onClick={() => openEditPublicModal(c)}
                              title="Edit Coupon"
                              className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete (Never allowed for WELCOME10) */}
                          {c.code !== "WELCOME10" && (
                            <button
                              onClick={() => setDeleteConfirmId(c.id)}
                              title="Delete Coupon"
                              className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONE-TIME CODE REVELATION DIALOG */}
      {revealedCodeData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <KeyRound className="w-6 h-6 text-amber-700 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-950">
                  Private Coupon Generated Successfully
                </h3>
                <p className="text-[11px] text-amber-800">
                  {revealedCodeData.description}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 text-white p-5 rounded-xl text-center space-y-2">
              <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono block">
                Cryptographic Private Code
              </span>
              <p className="font-mono text-xl tracking-wider text-amber-300 select-all font-bold">
                {revealedCodeData.code}
              </p>
            </div>

            {/* Warning Box */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-neutral-900">Security Notice:</strong> Please copy this code now. For security, this full private code is stored as a keyed HMAC digest and will <span className="underline font-semibold">never</span> be displayed again in plaintext.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopyCode(revealedCodeData.code)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition-colors shadow-xs"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setRevealedCodeData(null)}
                className="py-3 px-5 rounded-xl border border-neutral-300 bg-white font-semibold text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE PRIVATE COUPON MODAL */}
      {isPrivateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-neutral-900 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Generate Private Coupon
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Issues a cryptographically secure 80-bit entropy random code (RC-XXXX-XXXX-XXXX-XXXX)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivateModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePrivateCoupon} className="space-y-4">
              {/* Internal Name / Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Recipient or Campaign Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Influencer - Aditi, Support Replacement #1084"
                  value={privateDescription}
                  onChange={(e) => setPrivateDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Internal Audit Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Audit Reason for Issuance *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goodwill compensation for courier transit delay"
                  value={privateInternalReason}
                  onChange={(e) => setPrivateInternalReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={privateDiscountType}
                    onChange={(e) => setPrivateDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-hidden focus:border-neutral-900"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Discount Value {privateDiscountType === "PERCENTAGE" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder={privateDiscountType === "PERCENTAGE" ? "20" : "500"}
                    value={privateDiscountValue}
                    onChange={(e) => setPrivateDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Minimum Order & Max Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={privateMinOrderRupees}
                    onChange={(e) => setPrivateMinOrderRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 500)"
                    value={privateMaxDiscountRupees}
                    onChange={(e) => setPrivateMaxDiscountRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Single Use Checkbox */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privateIsSingleUse}
                    onChange={(e) => setPrivateIsSingleUse(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Single-Use Redemption (Strictly 1 total redemption)
                  </span>
                </label>
                <p className="text-[11px] text-neutral-500 pl-6">
                  Once redeemed by any customer, the code is immediately consumed and cannot be reused.
                </p>
              </div>

              {/* Customer Binding (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Restrict to Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@domain.com (Leave blank for bearer code)"
                  value={privateAssignedEmail}
                  onChange={(e) => setPrivateAssignedEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Stacking Rule */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Allow Stacking with Navratri Promotion
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    If disabled, customer cannot combine this coupon with the active Navratri sale.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={privateCanStack}
                  onChange={(e) => setPrivateCanStack(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={privateExpirationDate}
                  onChange={(e) => setPrivateExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsPrivateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Generating..." : "Generate Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE/EDIT PUBLIC COUPON MODAL */}
      {isPublicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {editingCoupon ? `Edit Public Offer: ${editingCoupon.code}` : "Create Public Promotional Coupon"}
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure storewide or public campaigns like WELCOME10
                </p>
              </div>
              <button
                onClick={() => setIsPublicModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Public Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10"
                  value={publicCode}
                  onChange={(e) => setPublicCode(e.target.value.toUpperCase())}
                  disabled={editingCoupon?.code === "WELCOME10"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 font-mono focus:outline-hidden focus:border-neutral-900 uppercase disabled:bg-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. First-Time Patron Welcome Offer"
                  value={publicDescription}
                  onChange={(e) => setPublicDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={publicDiscountType}
                    onChange={(e) => setPublicDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-hidden focus:border-neutral-900"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="10"
                    value={publicDiscountValue}
                    onChange={(e) => setPublicDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={publicMinOrderRupees}
                    onChange={(e) => setPublicMinOrderRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="300"
                    value={publicMaxDiscountRupees}
                    onChange={(e) => setPublicMaxDiscountRupees(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Max Total Redemptions
                  </label>
                  <input
                    type="number"
                    placeholder="Optional (e.g. 1000)"
                    value={publicUsageLimit}
                    onChange={(e) => setPublicUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Per Patron Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={publicPerUserLimit}
                    onChange={(e) => setPublicPerUserLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-xs font-semibold text-neutral-800 block">
                    Allow Stacking with Navratri Sale
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={publicCanStack}
                  onChange={(e) => setPublicCanStack(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsPublicModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOCATION CONFIRMATION MODAL */}
      {revokeConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Revoke Coupon Immediately
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This action immediately terminates all future redemptions of this coupon. Completed historical orders will preserve their historical discount records.
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Revocation Reason (Audit Log)
              </label>
              <input
                type="text"
                placeholder="e.g. Compromised code, customer resolution"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:border-rose-600"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRevokeConfirmId(null)}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeCoupon(revokeConfirmId)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {isPending ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              Are you sure you want to delete this coupon? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
