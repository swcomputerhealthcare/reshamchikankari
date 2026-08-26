import React from "react";
import Container from "@/components/ui/container";
import AdminWalletClient from "@/components/wallet/admin-wallet-client";
import { adminGetWithdrawalRequestsAction } from "@/actions/wallet";
import { requireAdmin } from "@/lib/auth/helpers";

export const metadata = {
  title: "Admin Wallet Manager — Resham Chikankari",
  description: "Review and process client payouts, adjust balances, and audit transactions.",
};

export default async function AdminWalletPage() {
  // Enforce admin privileges
  await requireAdmin();

  const res = await adminGetWithdrawalRequestsAction();
  const withdrawals = res.withdrawals || [];

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Management Portal
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Wallet & Ledger Adjustments
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Review customer withdrawal requests, execute payouts, and issue goodwill credits.
          </p>
        </Container>
      </div>

      <Container>
        <AdminWalletClient withdrawals={withdrawals} />
      </Container>
    </div>
  );
}
