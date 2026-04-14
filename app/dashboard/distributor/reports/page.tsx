"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatKES } from "@/app/lib/currency";
import { BarChart3, TrendingUp, ShoppingCart, AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";

interface ReportMetrics {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  alertedLowStockProducts: number;
  creditLimit: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalPriceKES: number;
  itemCount: number;
  createdAt: string;
}

interface RestockMetrics {
  requestsMade: number;
  quantityRequested: number;
}

interface Reports {
  metrics: ReportMetrics;
  ordersByStatus: OrderStatus[];
  recentOrders: RecentOrder[];
  restockMetrics: RestockMetrics;
}

export default function DistributorReports() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "DISTRIBUTOR") {
      router.replace("/auth/signin");
      return;
    }
    fetchReports();
  }, [session, status, timeRange]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/distributor/reports?days=${timeRange}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/dashboard/distributor" className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mt-4">Business Reports</h1>
            <p className="text-gray-300 mt-2">Your inventory and order performance</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-600 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {reports && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-pink-200 uppercase text-xs tracking-widest">Total Orders</p>
                  <ShoppingCart className="w-5 h-5 text-lime-400" />
                </div>
                <p className="text-2xl font-bold text-lime-300">{reports.metrics.totalOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-cyan-200 uppercase text-xs tracking-widest">Total Spent</p>
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-cyan-300">KES {formatKES(reports.metrics.totalSpent)}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-rose-200 uppercase text-xs tracking-widest">Pending Orders</p>
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-rose-300">{reports.metrics.pendingOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-yellow-200 uppercase text-xs tracking-widest">Low Stock Alerts</p>
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-300">{reports.metrics.alertedLowStockProducts}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-teal-200 uppercase text-xs tracking-widest">Credit Limit</p>
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-300">KES {formatKES(reports.metrics.creditLimit)}</p>
              </div>
            </div>

            {/* Orders by Status & Restock Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Orders by Status */}
              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">Orders by Status</h2>
                <div className="space-y-4">
                  {reports.ordersByStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <span className="text-gray-300">{status.status}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(status.count / reports.metrics.totalOrders) * 200}px` }}
                        />
                        <span className="text-white font-semibold w-12 text-right">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restock Metrics */}
              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">Restock Activity</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-300 mb-2">Restock Requests Made</p>
                    <p className="text-3xl font-bold text-lime-300">{reports.restockMetrics.requestsMade}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 mb-2">Total Quantity Requested</p>
                    <p className="text-3xl font-bold text-cyan-300">{reports.restockMetrics.quantityRequested}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-800/40">
                      <th className="text-left px-4 py-2 text-gray-300">Order #</th>
                      <th className="text-left px-4 py-2 text-gray-300">Status</th>
                      <th className="text-left px-4 py-2 text-gray-300">Payment</th>
                      <th className="text-right px-4 py-2 text-gray-300">Items</th>
                      <th className="text-right px-4 py-2 text-gray-300">Amount</th>
                      <th className="text-left px-4 py-2 text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.recentOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm text-purple-300">{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === "DELIVERED" ? "bg-green-900/40 text-green-300" : order.status === "SHIPPED" ? "bg-blue-900/40 text-blue-300" : "bg-yellow-900/40 text-yellow-300"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === "PAID" ? "bg-green-900/40 text-green-300" : "bg-orange-900/40 text-orange-300"}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="text-right px-4 py-3 text-gray-300">{order.itemCount}</td>
                        <td className="text-right px-4 py-3 text-lime-300 font-semibold">KES {formatKES(order.totalPriceKES)}</td>
                        <td className="px-4 py-3 text-gray-300 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
