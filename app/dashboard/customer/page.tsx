"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatKES } from "@/app/lib/currency";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { QuickActionCard, OrderList, LoadingSpinner } from "@/app/components/DashboardComponents";
import { ShoppingCart, Heart, User } from "lucide-react";

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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-xxxl">
      {/* Header */}
      <DashboardHeader
        title={`Welcome, ${session?.user?.name || "Customer"}`}
        description="Manage your orders, wishlist, and account settings"
      />

      {/* Quick Actions - Premium Cards */}
      <div>
        <div className="flex items-center gap-md mb-lg">
          <h2 className="text-h2 font-bold text-text-primary">Quick Actions</h2>
          <span className="text-xs uppercase letter-spacing-1 text-text-muted font-semibold">Essentials</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <QuickActionCard
            title="Shop Now"
            description="Browse and discover new products"
            href="/products"
            icon={<ShoppingCart className="w-8 h-8" />}
            color="accent"
          />
          <QuickActionCard
            title="Wishlist"
            description={`${wishlistCount} items saved`}
            href="/wishlist"
            icon={<Heart className="w-8 h-8" />}
            color="error"
          />
          <QuickActionCard
            title="Account Settings"
            description="Manage profile and preferences"
            href="/dashboard/account"
            icon={<User className="w-8 h-8" />}
            color="success"
          />
        </div>
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between gap-lg mb-lg">
          <h2 className="text-h2 font-bold text-text-primary">Your Orders</h2>
          <Link href="/orders" className="text-accent-500 hover:text-accent-400 text-sm font-semibold transition-colors duration-200">
            View All →
          </Link>
        </div>
        <OrderList
          orders={orders}
          emptyMessage="No orders yet. Start shopping to place your first order!"
          onOrderClick={(id) => router.push(`/orders/${id}`)}
        />
      </div>

      {/* CTA Section - Premium Empty State */}
      {orders.length === 0 && (
        <div className="card bg-gradient-to-br from-accent-500/10 to-accent-500/5 border border-accent-500/20 text-center py-xxxl px-lg">
          <div className="mb-lg">
            <div className="text-accent-500 text-5xl mb-lg">✨</div>
          </div>
          <h3 className="text-h2 font-bold text-text-primary mb-md">Ready to explore?</h3>
          <p className="text-body text-text-secondary mb-xl max-w-md mx-auto">
            Discover our exclusive collection of premium grooming products and lifestyle essentials
          </p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
