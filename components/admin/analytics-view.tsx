'use client';

import React from "react";
import { TrendingUp, ShoppingBag, BadgeCent, CreditCard } from "lucide-react";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  revenue: number;
  units: number;
}

interface PaymentStat {
  provider: string | null;
  count: number;
  revenue: number;
}

interface AnalyticsViewProps {
  totalRevenue: number;
  totalOrders: number;
  categoryStats: CategoryStat[];
  paymentStats: PaymentStat[];
}

export default function AnalyticsView({
  totalRevenue,
  totalOrders,
  categoryStats,
  paymentStats,
}: AnalyticsViewProps) {
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Find max category revenue for visual scaling
  const maxCategoryRevenue = Math.max(...categoryStats.map((c) => c.revenue), 1);

  // Sum up payment stats for percentages
  const totalPaymentRevenue = Math.max(paymentStats.reduce((sum, p) => sum + p.revenue, 0), 1);

  return (
    <div className="font-sans space-y-10 text-xs">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold">
              Gross sales
            </span>
            <TrendingUp className="h-4.5 w-4.5 text-brand-sage" />
          </div>
          <div className="text-2xl font-semibold text-brand-black">
            ₹{(totalRevenue / 100).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold">
              Total orders
            </span>
            <ShoppingBag className="h-4.5 w-4.5 text-brand-pink" />
          </div>
          <div className="text-2xl font-semibold text-brand-black">
            {totalOrders}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold">
              Average Order Value
            </span>
            <BadgeCent className="h-4.5 w-4.5 text-brand-sage" />
          </div>
          <div className="text-2xl font-semibold text-brand-black">
            ₹{(averageOrderValue / 100).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Visual Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Category */}
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
            Sales by Category
          </h3>

          {categoryStats.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No category sales data recorded.
            </div>
          ) : (
            <div className="space-y-5">
              {categoryStats
                .sort((a, b) => b.revenue - a.revenue)
                .map((cat) => {
                  const percentage = Math.round((cat.revenue / maxCategoryRevenue) * 100);
                  const share = ((cat.revenue / (totalRevenue || 1)) * 100).toFixed(1);
                  return (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-brand-black uppercase tracking-wider">
                          {cat.categoryName}
                        </span>
                        <div className="space-x-3">
                          <span className="text-neutral-400">{cat.units} sold</span>
                          <span className="font-bold text-brand-black">
                            ₹{(cat.revenue / 100).toLocaleString("en-IN")} ({share}%)
                          </span>
                        </div>
                      </div>
                      {/* Custom Horizontal Progress Bar */}
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-sage rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Sales by Payment Method */}
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
            Payment Provider Distribution
          </h3>

          {paymentStats.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              No transactions completed yet.
            </div>
          ) : (
            <div className="space-y-6">
              {paymentStats
                .sort((a, b) => b.revenue - a.revenue)
                .map((pay) => {
                  const percentage = ((pay.revenue / totalPaymentRevenue) * 100).toFixed(1);
                  const providerName = pay.provider === "RAZORPAY" ? "Online Cards / UPI" : pay.provider === "COD" ? "Cash on Delivery (COD)" : "Store Wallet Balance";
                  return (
                    <div key={pay.provider || "Unknown"} className="flex items-center gap-4 py-2 border-b border-neutral-50 last:border-0 last:pb-0">
                      <div className="h-9 w-9 bg-neutral-100 rounded-xs flex items-center justify-center flex-shrink-0 text-neutral-500">
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-brand-black truncate">
                          {providerName}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                          {pay.count} successful transactions
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-black block">
                          ₹{(pay.revenue / 100).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                          {percentage}% share
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
