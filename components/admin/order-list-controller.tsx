/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  paymentStatus: string;
  totalPaise: number;
  user: {
    fullName: string | null;
    email: string | null;
  } | null;
  shippingAddressSnapshot: any;
}

interface OrderListControllerProps {
  initialOrders: OrderItem[];
}

export default function OrderListController({ initialOrders }: OrderListControllerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((ord) => {
      const customerName = ord.user?.fullName || ord.shippingAddressSnapshot?.fullName || "";
      const customerEmail = ord.user?.email || ord.shippingAddressSnapshot?.email || "";
      
      const matchesSearch =
        ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        customerName.toLowerCase().includes(search.toLowerCase()) ||
        customerEmail.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || ord.status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" || ord.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [initialOrders, search, statusFilter, paymentFilter]);

  // Paginated orders
  const totalPages = Math.max(Math.ceil(filteredOrders.length / itemsPerPage), 1);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  return (
    <div className="font-sans">
      {/* Search and filter tools */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name/Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-brand-black/15 rounded-xs pl-10 pr-4 py-3 text-sm tracking-wide uppercase font-semibold text-brand-black focus:outline-none focus:border-brand-sage"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Fulfillment Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Fulfillment
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Payment
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-brand-black/15 rounded-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-black focus:outline-none focus:border-brand-sage"
            >
              <option value="ALL">All Payments</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="COD_PENDING">COD Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Directory */}
      <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
        <h2 className="text-base font-bold uppercase tracking-wider text-brand-black mb-6">
          Orders Ledger ({filteredOrders.length})
        </h2>

        {paginatedOrders.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No order records matched your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-xs font-bold bg-neutral-50/50">
                    <th className="py-4 pr-4 pl-3">Order ID</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Payment Status</th>
                    <th className="py-4 px-4">Fulfillment</th>
                    <th className="py-4 pl-4 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedOrders.map((ord) => {
                    const customerName = ord.user?.fullName || ord.shippingAddressSnapshot?.fullName || "Guest Customer";
                    const customerEmail = ord.user?.email || ord.shippingAddressSnapshot?.email || "-";
                    const [_, m, d] = new Date(ord.createdAt).toDateString().split(" ");
                    
                    return (
                      <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 pr-4 pl-3 font-sans font-bold text-brand-black text-sm">
                          #{ord.orderNumber}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-brand-black text-sm">{customerName}</div>
                          <div className="text-xs text-neutral-400 font-mono lowercase">{customerEmail}</div>
                        </td>
                        <td className="py-4 px-4 text-neutral-600 font-sans text-sm">
                          {d} {m} {new Date(ord.createdAt).getFullYear()}
                        </td>
                        <td className="py-4 px-4 font-bold text-brand-black text-sm">
                          ₹{(ord.totalPaise / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs ${
                              ord.paymentStatus === "PAID"
                                ? "bg-brand-sage/15 text-brand-sage border border-brand-sage/30"
                                : ord.paymentStatus === "FAILED"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xs ${
                              ord.status === "DELIVERED"
                                ? "bg-brand-sage text-white shadow-xs"
                                : ord.status === "SHIPPED"
                                ? "bg-brand-pink text-white shadow-xs"
                                : ord.status === "CANCELLED"
                                ? "bg-neutral-200 text-neutral-700"
                                : "bg-neutral-100 border border-neutral-200 text-neutral-800"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 pl-4 pr-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="inline-block text-xs font-bold text-brand-pink hover:text-brand-black transition-colors uppercase tracking-wider py-1 px-2 border border-brand-pink/20 hover:border-brand-black rounded-xs"
                          >
                            View Order →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-100 pt-6 mt-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-brand-black/10 rounded-xs text-neutral-500 hover:text-brand-black hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-brand-black/10 rounded-xs text-neutral-500 hover:text-brand-black hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
