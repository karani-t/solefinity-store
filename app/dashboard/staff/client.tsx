"use client";

import { useEffect, useState } from "react";
import { formatKES } from "@/app/lib/currency";
import { ChevronDown, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/app/components/Sidebar";
import { DashboardHeader, StatCard } from "@/app/components/DashboardHeader";
import { OrderList } from "@/app/components/DashboardComponents";

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
      <div className="flex min-h-screen bg-gradient-to-b from-base-950 via-base-900 to-base-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-400 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-base-950 via-base-900 to-base-950 text-text-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-lg sm:px-xxxl lg:px-max py-xxxl">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-lg right-lg px-lg py-md rounded-lg shadow-lg transition-opacity duration-3000 ${
                toast.type === "success"
                  ? "bg-success/20 border border-success text-success"
                  : "bg-error/20 border border-error text-error"
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Header with Reports Button */}
          <div className="flex-between mb-xxxl">
            <div>
              <h1 className="text-h1 font-bold">Staff Dashboard</h1>
              <p className="text-text-secondary text-body mt-md">Manage orders and process payments</p>
            </div>
            <Link 
              href="/dashboard/staff/reports" 
              className="btn btn-secondary flex-center gap-md"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid-cols-responsive mb-xxxl">
            <StatCard 
              label="Total Sales"
              value={`KES ${formatKES(stats.totalSales)}`}
              color="accent"
            />
            <StatCard 
              label="Orders Processed"
              value={stats.ordersProcessed.toString()}
              color="success"
            />
            <StatCard 
              label="Pending Payments"
              value={stats.pendingPayments.toString()}
              color="warning"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-md mb-xxxl flex-wrap">
            {(["ALL", "PENDING", "PROCESSING", "PAID_AWAITING"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${
                  filter === f
                    ? "btn btn-primary"
                    : "btn btn-ghost hover:bg-base-800"
                }`}
              >
                {f === "PAID_AWAITING" ? "To Ship" : f}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="space-y-md">
            {filteredOrders.length === 0 ? (
              <div className="card-lg text-center py-xxxl">
                <p className="text-text-muted">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-lg overflow-hidden transition-all hover:border-accent-500/30"
                >
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                    className="w-full px-lg py-md flex-between hover:bg-base-800/50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex-center gap-md mb-md">
                        <h3 className="font-bold text-lg">
                          Order #{order.orderNumber || order.id.slice(-8)}
                        </h3>
                        <span
                          className={`text-xs px-md py-xs rounded-full font-semibold ${
                            order.status === "DELIVERED"
                              ? "badge badge-success"
                              : order.status === "SHIPPED"
                              ? "badge badge-accent"
                              : order.status === "PROCESSING"
                              ? "badge badge-warning"
                              : "badge badge-error"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`text-xs px-md py-xs rounded-full font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "badge badge-success"
                              : "badge badge-warning"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {order.user.name} • {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        <span className="text-accent-400 font-semibold">
                          KES {formatKES(order.totalPriceKES || order.total || 0)}
                        </span>
                      </p>
                    </div>
                    <ChevronDown
                      className={`transition-transform w-5 h-5 ${
                        expandedOrder === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-base-700/50 px-lg py-md bg-base-900/50">
                      {/* Order Items */}
                      <div className="mb-lg">
                        <h4 className="font-semibold text-sm mb-md text-text-secondary">
                          Items ({order.items.length})
                        </h4>
                        <div className="space-y-sm">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex-between text-sm bg-base-800/50 p-md rounded-lg"
                            >
                              <span>
                                {item.product.name} x{item.quantity}
                              </span>
                              <span className="text-accent-400 font-semibold">
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
                      <div className="mb-lg">
                        <h4 className="font-semibold text-sm mb-md text-text-secondary">
                          Update Status
                        </h4>
                        <div className="flex gap-md flex-wrap">
                          {ORDER_STATUSES.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              disabled={
                                ORDER_STATUSES.indexOf(status) <
                                  ORDER_STATUSES.indexOf(order.status) ||
                                updateLoading[order.id]
                              }
                              className={`text-sm px-md py-xs rounded-lg font-semibold transition-all ${
                                status === order.status
                                  ? "btn btn-primary"
                                  : updateLoading[order.id] ||
                                    ORDER_STATUSES.indexOf(status) <
                                      ORDER_STATUSES.indexOf(order.status)
                                  ? "btn btn-ghost opacity-50 cursor-not-allowed"
                                  : "btn btn-ghost hover:bg-base-700"
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
                          className="w-full btn btn-success"
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
