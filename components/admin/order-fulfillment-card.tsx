'use client';

import React, { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/actions/order";
import {
  adminRetryShipmentAction,
  adminRetryAssignAWBAction,
  adminRetryPickupAction,
  syncOrderTrackingAction,
} from "@/actions/shiprocket";
import { Truck, RefreshCw, Package, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";

interface OrderFulfillmentCardProps {
  orderId: string;
  currentStatus: string;
  fulfillmentStatus?: string | null;
  shiprocketOrderId?: string | null;
  shiprocketShipmentId?: string | null;
  awbCode?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  shippingError?: string | null;
}

export default function OrderFulfillmentCard({
  orderId,
  currentStatus,
  fulfillmentStatus = "PENDING",
  shiprocketOrderId,
  shiprocketShipmentId,
  awbCode,
  courierName,
  trackingUrl,
  shippingError,
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
    const finalMessage = message.trim() || `Order status updated to ${status}`;

    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, status, finalMessage);
      if (res.success) {
        showToast("Order status updated successfully.");
        setMessage("");
      } else {
        showToast(res.error || "Failed to update order status.", true);
      }
    });
  };

  const handleShiprocketAction = (actionFn: () => Promise<any>, successMsg: string) => {
    startTransition(async () => {
      const res = await actionFn();
      if (res.success) {
        showToast(successMsg);
      } else {
        showToast(res.error || "Shiprocket action failed.", true);
      }
    });
  };

  return (
    <div className="bg-[#FFFDF9] border border-brand-black/5 p-6 rounded-xs font-sans space-y-6">
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

      <div className="flex items-center justify-between border-b border-brand-black/5 pb-4">
        <h4 className="text-sm uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2">
          <Truck className="h-4.5 w-4.5 text-brand-pink" />
          <span>Shiprocket Fulfillment</span>
        </h4>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-brand-sage/10 text-brand-sage rounded-xs">
          {fulfillmentStatus || "PENDING"}
        </span>
      </div>

      {/* Error Banner */}
      {shippingError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block uppercase tracking-wider text-[10px]">Fulfillment Error</span>
            <span>{shippingError}</span>
          </div>
        </div>
      )}

      {/* Details Box */}
      <div className="bg-white border border-brand-black/5 p-4 rounded-xs text-xs space-y-2 text-neutral-600 font-sans">
        <div className="flex justify-between">
          <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">Shiprocket Order ID</span>
          <span className="font-mono font-bold text-brand-black">{shiprocketOrderId || "Not Created"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">Shipment ID</span>
          <span className="font-mono font-bold text-brand-black">{shiprocketShipmentId || "Not Created"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">Courier</span>
          <span className="font-semibold text-brand-black">{courierName || "Pending Assignment"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">AWB Code</span>
          <span className="font-mono font-bold text-brand-black">{awbCode || "Not Assigned"}</span>
        </div>

        {trackingUrl && (
          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase font-bold text-brand-pink hover:text-brand-black flex items-center gap-1 tracking-wider"
            >
              <span>Live Tracking</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Shiprocket Quick Action Buttons */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
          Shiprocket Admin Actions
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {!shiprocketOrderId ? (
            <button
              onClick={() => handleShiprocketAction(() => adminRetryShipmentAction(orderId), "Shiprocket order created!")}
              disabled={isPending}
              className="col-span-2 py-2.5 bg-brand-sage hover:bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Create Shiprocket Order</span>
            </button>
          ) : (
            <>
              {!awbCode ? (
                <button
                  onClick={() => handleShiprocketAction(() => adminRetryAssignAWBAction(orderId), "AWB assigned successfully!")}
                  disabled={isPending}
                  className="py-2 bg-brand-black hover:bg-brand-sage text-white text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
                >
                  Assign AWB
                </button>
              ) : (
                <button
                  onClick={() => handleShiprocketAction(() => adminRetryPickupAction(orderId), "Pickup request scheduled!")}
                  disabled={isPending}
                  className="py-2 bg-brand-sage hover:bg-brand-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
                >
                  Schedule Pickup
                </button>
              )}

              <button
                onClick={() => handleShiprocketAction(() => syncOrderTrackingAction(orderId), "Tracking status synced!")}
                disabled={isPending}
                className="py-2 bg-neutral-100 hover:bg-neutral-200 text-brand-black text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
                <span>Sync Tracking</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual Status Override Form */}
      <form onSubmit={handleUpdate} className="space-y-4 text-sm border-t border-brand-black/5 pt-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
            Manual Status Override
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-brand-black/15 rounded-xs px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
          >
            <option value="PENDING">Pending Approval</option>
            <option value="PROCESSING">Processing & Packing</option>
            <option value="SHIPPED">Shipped (In Transit)</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="space-y-2">
          <textarea
            rows={2}
            placeholder="Log message for manual update..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white border border-brand-black/15 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-brand-sage font-medium text-brand-black leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-neutral-800 hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-xs"
        >
          {isPending ? "Updating..." : "Save Manual Override"}
        </button>
      </form>
    </div>
  );
}

