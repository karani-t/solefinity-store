"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatKES } from "@/app/lib/currency";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total?: number;
  totalPriceKES?: number;
  createdAt: string;
  items: Array<{ id: string; quantity: number; product: { name: string } }>;
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    fetchOrders();
    fetchWishlist();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders");
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

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlistCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-8">Welcome, {session?.user?.name}</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/products" className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-purple-600 transition cursor-pointer">
            <h3 className="text-xl font-bold text-pink-300 mb-2">🛍️ Shop</h3>
            <p className="text-gray-300">Browse and buy products</p>
          </Link>
          <Link href="/wishlist" className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-purple-600 transition cursor-pointer">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">❤️ Wishlist</h3>
            <p className="text-gray-300">{wishlistCount} items saved</p>
          </Link>
          <Link href="/dashboard/account" className="bg-gradient-to-br from-slate-900/70 to-purple-950/60 border border-purple-800/40 p-6 rounded-2xl shadow-2xl backdrop-blur-sm hover:border-purple-600 transition cursor-pointer">
            <h3 className="text-xl font-bold text-lime-300 mb-2">👤 Account</h3>
            <p className="text-gray-300">Manage profile & settings</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-700/40 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">No orders yet</p>
              <Link href="/products" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-slate-700/40 border border-purple-600/20 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber || order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold text-lime-300">KES {formatKES(order.totalPriceKES || order.total || 0)}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "DELIVERED" ? "bg-green-500/20 text-green-300" :
                      order.status === "SHIPPED" ? "bg-blue-500/20 text-blue-300" :
                      "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {order.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.paymentStatus === "PAID" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
