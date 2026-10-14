'use client';

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createCouponAction,
  updateCouponAction,
  toggleCouponStatusAction,
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
} from "lucide-react";

export interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minimumOrderPaise: number;
  maximumDiscountPaise?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit: number;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  isActive: boolean;
  createdAt?: Date | string;
}

interface CouponListControllerProps {
  initialCoupons: CouponItem[];
}

export default function CouponListController({ initialCoupons }: CouponListControllerProps) {
  const router = useRouter();
  const [couponsList, setCouponsList] = useState<CouponItem[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PERCENTAGE" | "FIXED">("ALL");
  const [isPending, startTransition] = useTransition();

  // Toast
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);
  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderRupees, setMinOrderRupees] = useState("");
  const [maxDiscountRupees, setMaxDiscountRupees] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinOrderRupees("");
    setMaxDiscountRupees("");
    setUsageLimit("");
    setPerUserLimit("1");
    setStartDate("");
    setExpirationDate("");
    setIsActive(true);
    setEditingCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.type === "FIXED" || c.type === "FIXED_AMOUNT" ? "FIXED" : "PERCENTAGE");
    setDiscountValue(
      c.type === "PERCENTAGE" ? c.value.toString() : (c.value / 100).toString()
    );
    setMinOrderRupees((c.minimumOrderPaise / 100).toString());
    setMaxDiscountRupees(c.maximumDiscountPaise ? (c.maximumDiscountPaise / 100).toString() : "");
    setUsageLimit(c.usageLimit?.toString() || "");
    setPerUserLimit(c.perUserLimit?.toString() || "1");
    setStartDate(c.startsAt ? new Date(c.startsAt).toISOString().split("T")[0] : "");
    setExpirationDate(c.expiresAt ? new Date(c.expiresAt).toISOString().split("T")[0] : "");
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return couponsList.filter((c) => {
      const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.isActive) ||
        (statusFilter === "INACTIVE" && !c.isActive);
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "PERCENTAGE" && c.type === "PERCENTAGE") ||
        (typeFilter === "FIXED" && (c.type === "FIXED" || c.type === "FIXED_AMOUNT"));

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [couponsList, search, statusFilter, typeFilter]);

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

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      showToast("Coupon code is required.", true);
      return;
    }

    const valNum = parseFloat(discountValue);
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Please enter a valid positive discount value.", true);
      return;
    }

    if (discountType === "PERCENTAGE" && valNum > 90) {
      showToast("Percentage discount cannot exceed 90%.", true);
      return;
    }

    const minOrderVal = parseFloat(minOrderRupees) || 0;
    const maxDiscountVal = maxDiscountRupees ? parseFloat(maxDiscountRupees) : null;
    const usageLimitVal = usageLimit ? parseInt(usageLimit, 10) : null;
    const perUserVal = parseInt(perUserLimit, 10) || 1;

    // Convert values to paise for storage
    const storageValue = discountType === "PERCENTAGE" ? Math.round(valNum) : Math.round(valNum * 100);
    const minOrderPaise = Math.round(minOrderVal * 100);
    const maxDiscountPaise = maxDiscountVal ? Math.round(maxDiscountVal * 100) : null;

    startTransition(async () => {
      if (editingCoupon) {
        const res = await updateCouponAction(editingCoupon.id, {
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: storageValue,
          minOrderValuePaise: minOrderPaise,
          maxDiscountValuePaise: maxDiscountPaise,
          startDate: startDate || null,
          expirationDate: expirationDate || null,
          usageLimit: usageLimitVal,
          perUserLimit: perUserVal,
          isActive,
        });

        if (res.success) {
          showToast(`Coupon '${code.trim().toUpperCase()}' updated.`);
          setCouponsList((prev) =>
            prev.map((c) =>
              c.id === editingCoupon.id
                ? {
                    ...c,
                    code: code.trim().toUpperCase(),
                    type: discountType,
                    value: storageValue,
                    minimumOrderPaise: minOrderPaise,
                    maximumDiscountPaise: maxDiscountPaise,
                    startsAt: startDate ? new Date(startDate) : null,
                    expiresAt: expirationDate ? new Date(expirationDate) : null,
                    usageLimit: usageLimitVal,
                    perUserLimit: perUserVal,
                    isActive,
                  }
                : c
            )
          );
          setIsModalOpen(false);
          resetForm();
          router.refresh();
        } else {
          showToast(res.error || "Failed to update coupon.", true);
        }
      } else {
        const res = await createCouponAction({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: storageValue,
          minOrderValuePaise: minOrderPaise,
          maxDiscountValuePaise: maxDiscountPaise,
          startDate: startDate || null,
          expirationDate: expirationDate || null,
          usageLimit: usageLimitVal,
          perUserLimit: perUserVal,
          isActive,
        });

        if (res.success && res.id) {
          showToast(`Coupon '${code.trim().toUpperCase()}' created.`);
          setCouponsList([
            {
              id: res.id,
              code: code.trim().toUpperCase(),
              type: discountType,
              value: storageValue,
              minimumOrderPaise: minOrderPaise,
              maximumDiscountPaise: maxDiscountPaise,
              startsAt: startDate ? new Date(startDate) : null,
              expiresAt: expirationDate ? new Date(expirationDate) : null,
              usageLimit: usageLimitVal,
              usageCount: 0,
              perUserLimit: perUserVal,
              isActive,
              createdAt: new Date(),
            },
            ...couponsList,
          ]);
          setIsModalOpen(false);
          resetForm();
          router.refresh();
        } else {
          showToast(res.error || "Failed to create coupon.", true);
        }
      }
    });
  };

  return (
    <div className="font-sans space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all ${
            toast.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-brand-black/15 rounded-xs pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
          >
            <option value="ALL">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₹)</option>
          </select>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
        <h2 className="text-base font-bold uppercase tracking-wider text-brand-black mb-6 flex items-center justify-between">
          <span>Coupons Directory ({filteredCoupons.length})</span>
          <span className="text-xs text-neutral-400 font-normal">Real database records</span>
        </h2>

        {filteredCoupons.length === 0 ? (
          <div className="text-center py-20 text-neutral-400 text-xs">
            No coupon codes match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-xs font-bold bg-neutral-50/50">
                  <th className="py-4 pr-4 pl-3">Coupon Code</th>
                  <th className="py-4 px-4">Discount</th>
                  <th className="py-4 px-4">Min. Order</th>
                  <th className="py-4 px-4">Max. Cap</th>
                  <th className="py-4 px-4">Redemptions</th>
                  <th className="py-4 px-4">Validity</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 pl-4 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCoupons.map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                  const isPercentage = c.type === "PERCENTAGE";

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 pr-4 pl-3 font-mono font-bold text-brand-black text-sm">
                        <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-[2px] tracking-wider">
                          {c.code}
                        </span>
                        {c.code === "WELCOME10" && (
                          <span className="ml-2 text-[9px] uppercase font-bold tracking-widest text-brand-pink bg-brand-pink/10 px-1.5 py-0.5 rounded-[2px]">
                            Core Welcome Offer
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-brand-black">
                        {isPercentage ? `${c.value}% OFF` : `₹${(c.value / 100).toLocaleString("en-IN")} FLAT`}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-sans">
                        ₹{(c.minimumOrderPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-neutral-600 font-sans">
                        {c.maximumDiscountPaise ? `₹${(c.maximumDiscountPaise / 100).toLocaleString("en-IN")}` : "No Limit"}
                      </td>
                      <td className="py-4 px-4 font-sans text-neutral-700">
                        <span className="font-semibold">{c.usageCount}</span>
                        {c.usageLimit ? ` / ${c.usageLimit}` : " (unlimited)"}
                        <div className="text-[10px] text-neutral-400">Limit: {c.perUserLimit}/patron</div>
                      </td>
                      <td className="py-4 px-4 text-neutral-500 font-sans text-xs">
                        {c.expiresAt ? (
                          <span className={isExpired ? "text-red-500 font-semibold" : ""}>
                            {new Date(c.expiresAt).toDateString().slice(4)}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-neutral-400">Never expires</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(c.id, c.isActive)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-xs border transition-colors cursor-pointer ${
                            c.isActive
                              ? "bg-brand-sage/15 border-brand-sage/30 text-brand-sage"
                              : "bg-neutral-100 border-neutral-200 text-neutral-500"
                          }`}
                        >
                          {c.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>{c.isActive ? "Active" : "Disabled"}</span>
                        </button>
                      </td>
                      <td className="py-4 pl-4 pr-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider py-1 px-1.5 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        {c.code !== "WELCOME10" && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider py-1 px-1.5 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-brand-black/10 rounded-xs max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="font-display text-xl text-brand-black tracking-wide flex items-center gap-2">
                <Ticket className="h-5 w-5 text-brand-pink" />
                <span>{editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-brand-black cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-mono font-bold uppercase rounded-xs"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs font-bold uppercase tracking-wider rounded-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    {discountType === "PERCENTAGE" ? "Percentage Off (%)" : "Flat Amount Off (₹)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 500"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold rounded-xs"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 1000"
                    value={minOrderRupees}
                    onChange={(e) => setMinOrderRupees(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold rounded-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Maximum Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder={discountType === "PERCENTAGE" ? "e.g. 300 (Optional)" : "N/A for flat"}
                    value={maxDiscountRupees}
                    onChange={(e) => setMaxDiscountRupees(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold rounded-xs"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Global Total Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500 (blank = unlimited)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Per-Customer Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer pt-2 text-xs uppercase font-bold tracking-wider text-neutral-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 text-brand-sage border-neutral-300 focus:ring-brand-sage"
                />
                <span>Enable Coupon immediately for checkout</span>
              </label>

              {/* Actions */}
              <div className="border-t border-neutral-100 pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-brand-black/10 hover:bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider font-bold rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-xs uppercase tracking-widest font-bold rounded-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border border-brand-black/10 p-6 sm:p-8 rounded-xs max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-display text-lg text-brand-black">Delete Coupon Permanently?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This action cannot be undone. Customers will no longer be able to redeem this coupon code at checkout.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-brand-black/10 hover:bg-neutral-50 text-neutral-600 text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded-xs"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
