import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import AdminWalletController from "@/components/admin/admin-wallet-controller";
import { adminGetWithdrawalRequestsAction } from "@/actions/wallet";

export const metadata = {
  title: "RC Wallet & Payouts — Resham Atelier Admin",
  description: "Manage customer wallet withdrawal requests, bank and UPI payout destinations, and store credits.",
};

export default async function AdminWalletPage() {
  await requireAdmin();

  const reqsRes = await adminGetWithdrawalRequestsAction();
  const withdrawals = reqsRes.withdrawals || [];

  return (
    <div className="pb-24 selection:bg-brand-pink/20 font-sans text-left">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Financial Ledger & Operations
          </span>
          <h1 className="font-display text-3xl tracking-wide text-white">
            RC Wallet & Payout Disbursements
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Process customer withdrawal requests directly to their Indian Bank Account (IMPS/NEFT) or UPI VPA, review transfer destinations, and issue store adjustments.
          </p>
        </Container>
      </div>

      {/* Main Wallet Controller */}
      <Container>
        <AdminWalletController initialWithdrawals={withdrawals} />
      </Container>
    </div>
  );
}
