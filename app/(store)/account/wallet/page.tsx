import React from "react";
import Container from "@/components/ui/container";
import WalletClient from "@/components/wallet/wallet-client";
import { getWalletAction, getWalletTransactionsAction, getPayoutMethodsAction, getWithdrawalRequestsAction } from "@/actions/wallet";

export const metadata = {
  title: "My Wallet — Resham Chikankari",
  description: "Check your available store balance, transaction logs, and payout withdrawals.",
};

export default async function WalletPage() {
  const walletRes = await getWalletAction();
  const txRes = await getWalletTransactionsAction();
  const payoutRes = await getPayoutMethodsAction();
  const withdrawRes = await getWithdrawalRequestsAction();

  const wallet = walletRes.wallet || { availableBalancePaise: 0, lockedBalancePaise: 0, currency: "INR" };
  const transactions = txRes.transactions || [];
  const payoutMethods = payoutRes.payoutMethods || [];
  const withdrawals = withdrawRes.withdrawals || [];

  return (
    <div className="py-16 sm:py-24">
      <Container className="max-w-6xl">
        <div className="mb-12 border-b border-brand-black/5 pb-8 text-left">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] font-sans uppercase font-bold text-[#77716A] mb-3 block pl-0.5">
            YOUR ACCOUNT
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-black pl-0.5">
            RC Wallet
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716A] mt-2 pl-0.5">
            Manage your withdrawable store refund balance, verified payout destinations, and transaction ledger.
          </p>
        </div>

        <WalletClient
          wallet={wallet}
          transactions={transactions}
          payoutMethods={payoutMethods}
          withdrawals={withdrawals}
        />
      </Container>
    </div>
  );
}
