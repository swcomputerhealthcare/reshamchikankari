'use client';

import React, { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "@/actions/settings";
import { Save, AlertTriangle, Settings as SettingsIcon } from "lucide-react";

interface SiteSettings {
  storeName: string;
  storeEmail: string;
  supportPhone?: string | null;
  shippingThreshold: number;
  announcementBarText?: string | null;
  maintenanceMode: boolean;
}

interface SiteSettingsFormProps {
  settings: SiteSettings | null;
}

export default function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states
  const [storeName, setStoreName] = useState(settings?.storeName || "Resham Chikankari");
  const [storeEmail, setStoreEmail] = useState(settings?.storeEmail || "support@reshamk.com");
  const [supportPhone, setSupportPhone] = useState(settings?.supportPhone || "");
  const [shippingThreshold, setShippingThreshold] = useState(
    settings?.shippingThreshold ? (settings.shippingThreshold / 100).toString() : "0"
  );
  const [announcementText, setAnnouncementText] = useState(settings?.announcementBarText || "");
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode || false);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeEmail) {
      showToast("Store Name and Support Email are required fields.", true);
      return;
    }

    const thresholdVal = parseFloat(shippingThreshold);
    if (isNaN(thresholdVal) || thresholdVal < 0) {
      showToast("Please enter a valid shipping threshold.", true);
      return;
    }

    startTransition(async () => {
      const res = await updateSiteSettingsAction({
        storeName,
        storeEmail,
        supportPhone: supportPhone || null,
        shippingThreshold: Math.round(thresholdVal * 100),
        announcementBarText: announcementText || null,
        maintenanceMode,
      });

      if (res.success) {
        showToast("Store settings saved successfully.");
      } else {
        showToast(res.error || "Failed to update settings.", true);
      }
    });
  };

  return (
    <div className="font-sans text-xs max-w-2xl mx-auto">
      {/* Toast alert */}
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

      {/* Main Form Box */}
      <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs space-y-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2 border-b border-neutral-100 pb-3">
          <SettingsIcon className="h-4.5 w-4.5 text-brand-pink" />
          <span>Global Store parameters</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Store Name (Branding)
              </span>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Store Support Phone
              </span>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Support Email */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Support & Contact Email
              </span>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Free Shipping threshold */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Free Shipping Threshold (INR)
              </span>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-neutral-400 font-sans">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={shippingThreshold}
                  onChange={(e) => setShippingThreshold(e.target.value)}
                  className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs pl-7 pr-3 py-2.5 text-xs focus:outline-none font-semibold text-brand-black"
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
              storefront Announcement Bar
            </span>
            <input
              type="text"
              placeholder="e.g. Free shipping on all prepaid orders above ₹1,999!"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-neutral-50 border border-brand-black/10 rounded-xs px-3 py-2.5 text-xs focus:outline-none"
            />
            <span className="text-[9px] text-neutral-400 block pt-0.5 leading-normal">
              This text is displayed in the ticker at the very top of all shop pages.
            </span>
          </div>

          {/* Maintenance Mode */}
          <div className="border border-amber-200/40 bg-amber-50/20 p-4 rounded-xs flex flex-col gap-3">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-800 uppercase block tracking-wider mb-0.5">Danger: Maintenance Mode</span>
                Turning this on will block storefront checkout operations, redirecting visitors to a service offline holding page.
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest text-amber-800 pl-8 pt-1">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4.5 w-4.5 text-brand-sage focus:ring-brand-sage"
              />
              <span>Activate storefront maintenance lockout</span>
            </label>
          </div>

          {/* Submit */}
          <div className="border-t border-neutral-100 pt-6 mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Save className="h-4 w-4" />
              <span>{isPending ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
