"use client";

import { useEffect, useState } from "react";
import { formatKES } from "@/app/lib/currency";
import { ChevronDown, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/app/components/Sidebar";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  total?: number;
  totalPriceKES?: number;
  createdAt: string;
  user: { name: string; email: string };
  items: Array<{ id: string; quantity: number; price?: number; priceKES?: number; product: { name: string } }>;
}

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function StaffDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, ordersProcessed: 0, pendingPayments: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROCESSING" | "PAID_AWAITING">("ALL");

  useEffect(() => {
    fetchOrders();
    fetchStats();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        const orderList = Array.isArray(data) ? data : data.orders || [];
        const totalSales = orderList.reduce((sum: number, o: Order) => sum + (o.totalPriceKES || o.total || 0), 0);
        const ordersProcessed = orderList.length;
        const pendingPayments = orderList.filter((o: Order) => o.paymentStatus === "PENDING").length;
        setStats({ totalSales, ordersProcessed, pendingPayments });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdateLoading({ ...updateLoading, [orderId]: true });
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setToast({ message: `Order updated to ${newStatus}`, type: "success" });
        fetchOrders();
        fetchStats();
      } else {
        setToast({ message: "Failed to update order", type: "error" });
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setToast({ message: "Error updating order", type: "error" });
    } finally {
      setUpdateLoading({ ...updateLoading, [orderId]: false });
    }
  };

  const confirmPayment = async (orderId: string) => {
    setUpdateLoading({ ...updateLoading, [orderId]: true });
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });
      if (res.ok) {
        setToast({ message: "Payment confirmed", type: "success" });
        fetchOrders();
        fetchStats();
      } else {
        setToast({ message: "Failed to confirm payment", type: "error" });
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setToast({ message: "Error confirming payment", type: "error" });
    } finally {
      setUpdateLoading({ ...updateLoading, [orderId]: false });
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return order.status === "PENDING";
    if (filter === "PROCESSING") return order.status === "PROCESSING";
    if (filter === "PAID_AWAITING") return order.paymentStatus === "PAID" && order.status !== "DELIVERED";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-3000 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-8 flex items-center justify-between">
          <span>Staff Dashboard</span>
          <Link href="/dashboard/staff/reports" className="ml-4 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 rounded-lg font-semibold flex items-center gap-2 transition-all">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Reports</span>
          </Link>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
            <p className="text-pink-200 uppercase text-xs tracking-widest">Total Sales</p>
            <p className="text-3xl font-bold text-lime-300 mt-2">KES {formatKES(stats.totalSales)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
            <p className="text-pink-200 uppercase text-xs tracking-widest">Orders Processed</p>
            <p className="text-3xl font-bold text-cyan-300 mt-2">{stats.ordersProcessed}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
            <p className="text-pink-200 uppercase text-xs tracking-widest">Pending Payments</p>
            <p className="text-3xl font-bold text-rose-300 mt-2">{stats.pendingPayments}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["ALL", "PENDING", "PROCESSING", "PAID_AWAITING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === f
                  ? "bg-fuchsia-500 text-white shadow-lg"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {f === "PAID_AWAITING" ? "To Ship" : f}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">
                        Order #{order.orderNumber || order.id.slice(-8)}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-green-900/40 text-green-300"
                            : order.status === "SHIPPED"
                            ? "bg-blue-900/40 text-blue-300"
                            : order.status === "PROCESSING"
                            ? "bg-yellow-900/40 text-yellow-300"
                            : "bg-red-900/40 text-red-300"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-900/40 text-green-300"
                            : "bg-amber-900/40 text-amber-300"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {order.user.name} • {new Date(order.createdAt).toLocaleDateString()} •{" "}
                      <span className="text-fuchsia-300 font-semibold">
                        KES {formatKES(order.totalPriceKES || order.total || 0)}
                      </span>
                    </p>
                  </div>
                  <ChevronDown
                    className={`transition-transform ${
                      expandedOrder === order.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-slate-700/50 px-6 py-4 bg-slate-900/20">
                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-3 text-gray-300">
                        Items ({order.items.length})
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm bg-slate-800/50 p-2 rounded"
                          >
                            <span>
                              {item.product.name} x{item.quantity}
                            </span>
                            <span className="text-fuchsia-300">
                              KES{" "}
                              {formatKES(
                                ((item.priceKES || item.price) as number) *
                                  item.quantity || 0
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update Controls */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-3 text-gray-300">
                        Update Status
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {ORDER_STATUSES.map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={
                              ORDER_STATUSES.indexOf(status) <
                                ORDER_STATUSES.indexOf(order.status) ||
                              updateLoading[order.id]
                            }
                            className={`text-sm px-3 py-1 rounded-full font-semibold transition-all ${
                              status === order.status
                                ? "bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500"
                                : updateLoading[order.id] ||
                                  ORDER_STATUSES.indexOf(status) <
                                    ORDER_STATUSES.indexOf(order.status)
                                ? "bg-slate-700 text-gray-500 cursor-not-allowed"
                                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                            }`}
                          >
                            {updateLoading[order.id] && status === order.status
                              ? "..."
                              : status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Controls */}
                    {order.paymentStatus === "PENDING" && (
                      <button
                        onClick={() => confirmPayment(order.id)}
                        disabled={updateLoading[order.id]}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-all"
                      >
                        {updateLoading[order.id] ? "Processing..." : "Confirm Payment"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
