'use client';

import React, { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/actions/order";
import { Truck } from "lucide-react";

interface OrderFulfillmentCardProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderFulfillmentCard({
  orderId,
  currentStatus,
}: OrderFulfillmentCardProps) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Please enter a status update message.", true);
      return;
    }

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, status, message.trim());
      if (res.success) {
        showToast("Order status updated successfully.");
        setMessage("");
      } else {
        showToast(res.error || "Failed to update order status.", true);
      }
    });
  };

  return (
    <div className="bg-[#FFFDF9] border border-brand-black/5 p-6 rounded-xs font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest rounded-xs shadow-md ${
            toast.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {toast.text}
        </div>
      )}

      <h4 className="text-xs uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-4">
        <Truck className="h-4 w-4 text-brand-pink" />
        <span>Fulfillment Actions</span>
      </h4>

      <form onSubmit={handleUpdate} className="space-y-4 text-xs">
        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Fulfillment status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none"
          >
            <option value="PENDING">Pending Approval</option>
            <option value="PROCESSING">Processing & Packing</option>
            <option value="SHIPPED">Shipped (In Transit)</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
            Fulfillment log message
          </span>
          <textarea
            rows={3}
            placeholder="e.g. Order packed and shipped via BlueDart with tracking #10024"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white border border-brand-black/10 rounded-xs px-3 py-2 text-xs focus:outline-none leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
        >
          {isPending ? "Updating Status..." : "Update Status & Log"}
        </button>
      </form>
    </div>
  );
}
