"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { PaginatedResponse } from "@/types";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { Search } from "lucide-react";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await api.get<PaginatedResponse<CustomerRow>>(
        `/api/admin/customers?${params.toString()}`
      );
      if (res.success && res.data) {
        setCustomers(res.data);
        if (res.pagination) setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f5f0e8]">Customers</h1>

      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#f5f0e8] placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={10} columns={5} />
      ) : customers.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/30 text-sm">No customers found</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Joined
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#c9a84c]/15 flex items-center justify-center text-[#c9a84c] text-xs font-bold">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <span className="text-sm text-[#f5f0e8]/80">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-white/50">
                      {customer.email}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] font-medium">
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-white/30">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                      {customer._count.orders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-white/30">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
