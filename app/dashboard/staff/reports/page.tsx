"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatKES } from "@/app/lib/currency";
import { BarChart3, TrendingUp, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";

interface ReportMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalItemsSold: number;
  ordersProcessed: number;
  averageOrderValue: number;
}

interface OrderStatus {
  status: string;
  count: number;
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  ordersCount: number;
}

interface Reports {
  metrics: ReportMetrics;
  ordersByStatus: OrderStatus[];
  topProducts: TopProduct[];
  dailyRevenue: DailyRevenue[];
}

export default function StaffReports() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "STAFF") {
      router.replace("/auth/signin");
      return;
    }
    fetchReports();
  }, [session, status, timeRange]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/staff/reports?days=${timeRange}`);
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
            <Link href="/dashboard/staff" className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mt-4">Sales Reports</h1>
            <p className="text-gray-300 mt-2">Your personal sales performance metrics</p>
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
                  <p className="text-pink-200 uppercase text-xs tracking-widest">Total Revenue</p>
                  <TrendingUp className="w-5 h-5 text-lime-400" />
                </div>
                <p className="text-2xl font-bold text-lime-300">KES {formatKES(reports.metrics.totalRevenue)}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-cyan-200 uppercase text-xs tracking-widest">Total Orders</p>
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-cyan-300">{reports.metrics.totalOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-rose-200 uppercase text-xs tracking-widest">Items Sold</p>
                  <Package className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-rose-300">{reports.metrics.totalItemsSold}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-teal-200 uppercase text-xs tracking-widest">Delivered</p>
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                </div>
                <p className="text-2xl font-bold text-teal-300">{reports.metrics.ordersProcessed}</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-amber-200 uppercase text-xs tracking-widest">Avg Order Value</p>
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-amber-300">KES {formatKES(reports.metrics.averageOrderValue)}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Orders by Status */}
              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">Orders by Status</h2>
                <div className="space-y-4">
                  {reports.ordersByStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <span className="text-gray-300">{status.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-fuchsia-500 to-purple-500 h-2 rounded-full" style={{ width: `${(status.count / reports.metrics.totalOrders) * 200}px` }} />
                        <span className="text-white font-semibold w-12 text-right">{status.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">Top Selling Products</h2>
                <div className="space-y-4">
                  {reports.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-300">{product.name}</span>
                      </div>
                      <span className="text-white font-semibold">{product.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Revenue Trend */}
            <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">Daily Revenue Trend</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-800/40">
                      <th className="text-left px-4 py-2 text-gray-300">Date</th>
                      <th className="text-right px-4 py-2 text-gray-300">Revenue</th>
                      <th className="text-right px-4 py-2 text-gray-300">Orders</th>
                      <th className="text-right px-4 py-2 text-gray-300">Avg/Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.dailyRevenue.slice(-14).map((day) => (
                      <tr key={day.date} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-gray-300">{new Date(day.date).toLocaleDateString()}</td>
                        <td className="text-right px-4 py-3 text-lime-300 font-semibold">KES {formatKES(day.revenue)}</td>
                        <td className="text-right px-4 py-3 text-cyan-300">{day.ordersCount}</td>
                        <td className="text-right px-4 py-3 text-amber-300">KES {formatKES(day.revenue / (day.ordersCount || 1))}</td>
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
