'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomerItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
}

interface CustomerListControllerProps {
  initialCustomers: CustomerItem[];
}

export default function CustomerListController({ initialCustomers }: CustomerListControllerProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      const name = c.fullName || "";
      const email = c.email || "";
      const phone = c.phone || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        phone.includes(search)
      );
    });
  }, [initialCustomers, search]);

  const totalPages = Math.max(Math.ceil(filteredCustomers.length / itemsPerPage), 1);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  return (
    <div className="font-sans">
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search Customers by Name or Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-brand-black/15 rounded-xs pl-10 pr-4 py-3 text-sm tracking-wide uppercase font-semibold text-brand-black focus:outline-none focus:border-brand-sage"
          />
        </div>
      </div>

      {/* Directory table */}
      <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
        <h2 className="text-base font-bold uppercase tracking-wider text-brand-black mb-6">
          Registered Customers ({filteredCustomers.length})
        </h2>

        {paginatedCustomers.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No customer records matched your query.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-widest text-xs font-bold bg-neutral-50/50">
                    <th className="py-4 pr-4 pl-3">Customer Details</th>
                    <th className="py-4 px-4">Contact Information</th>
                    <th className="py-4 px-4">Joined Date</th>
                    <th className="py-4 px-4">Orders Count</th>
                    <th className="py-4 px-4">Total Spent</th>
                    <th className="py-4 pl-4 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedCustomers.map((cust) => {
                    const [_, m, d] = new Date(cust.createdAt).toDateString().split(" ");
                    return (
                      <tr key={cust.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 pr-4 pl-3">
                          <div className="font-bold text-brand-black text-sm">
                            {cust.fullName || "Guest Customer"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-neutral-600 font-sans text-sm">
                          <div className="font-semibold text-brand-black">{cust.email || "-"}</div>
                          <div className="text-xs text-neutral-400">{cust.phone || "-"}</div>
                        </td>
                        <td className="py-4 px-4 text-neutral-600 font-sans text-sm">
                          {d} {m} {new Date(cust.createdAt).getFullYear()}
                        </td>
                        <td className="py-4 px-4 font-bold text-brand-black font-sans text-sm">
                          {cust.orderCount} {cust.orderCount === 1 ? "order" : "orders"}
                        </td>
                        <td className="py-4 px-4 font-bold text-brand-black font-sans text-sm">
                          ₹{(cust.totalSpent / 100).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 pl-4 pr-3 text-right">
                          <Link
                            href={`/admin/customers/${cust.id}`}
                            className="inline-block text-xs font-bold text-brand-pink hover:text-brand-black transition-colors uppercase tracking-wider py-1 px-2 border border-brand-pink/20 hover:border-brand-black rounded-xs"
                          >
                            View Details →
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
