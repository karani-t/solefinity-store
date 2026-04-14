import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatKES } from "../lib/currency";
import { DashboardHeader, StatCard, AlertBox } from "../components/DashboardHeader";
import { Package, TrendingUp, AlertTriangle, Users, ShoppingCart } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/customer");
  }

  // Fetch dashboard data
  const [orders, lowStockProducts, totalProducts, totalUsers, totalRevenue] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockThreshold,
        },
      },
    }),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: {
        totalPriceKES: true,
      },
    }),
  ]);

  return (
    <div className="space-y-xxxl">
      {/* Header */}
      <DashboardHeader
        title="Admin Dashboard"
        description="Manage products, staff, distributors, and view key metrics"
        action={{
          label: "View Analytics",
          href: "/admin/analytics",
        }}
      />

      {/* Stat Cards Grid */}
      <div className="grid-cols-responsive">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={<Package className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
          color="accent"
        />
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          color="success"
        />
        <StatCard
          label="Total Revenue"
          value={`KES ${formatKES(totalRevenue._sum.totalPriceKES || 0)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 23, isPositive: true }}
          color="accent"
        />
        <StatCard
          label="Recent Orders"
          value={orders.length}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="success"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h2 font-semibold text-text-primary mb-lg">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            {
              label: "Products",
              href: "/admin/products",
              icon: <Package className="w-6 h-6" />,
            },
            {
              label: "Staff",
              href: "/admin/staff",
              icon: <Users className="w-6 h-6" />,
            },
            {
              label: "Distributors",
              href: "/admin/distributors",
              icon: <TrendingUp className="w-6 h-6" />,
            },
            {
              label: "Reviews",
              href: "/admin/reviews",
              icon: <AlertTriangle className="w-6 h-6" />,
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-interactive group flex flex-col items-center justify-center py-xxxl text-center hover:bg-base-700"
            >
              <div className="mb-lg text-accent-500 group-hover:text-accent-400 transition-smooth">
                {item.icon}
              </div>
              <h3 className="text-h4 font-semibold text-text-primary">{item.label}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <AlertBox
          type="warning"
          title="Low Stock Alerts"
          message={`${lowStockProducts.length} product(s) are running low on inventory`}
          action={{
            label: "Review Products",
            onClick: () => {},
          }}
        />
      )}

      {/* Recent Orders Table */}
      <div>
        <h2 className="text-h2 font-semibold text-text-primary mb-lg">Recent Orders</h2>
        <div className="card-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-base-800">
                <th className="text-label text-text-muted text-left px-lg py-md">Order ID</th>
                <th className="text-label text-text-muted text-left px-lg py-md">Customer</th>
                <th className="text-label text-text-muted text-left px-lg py-md">Amount</th>
                <th className="text-label text-text-muted text-left px-lg py-md">Items</th>
                <th className="text-label text-text-muted text-left px-lg py-md">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-base-800 hover:bg-base-800/50 transition-smooth"
                >
                  <td className="px-lg py-lg text-body text-text-primary font-mono">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-lg py-lg text-body text-text-primary">
                    {order.user?.email || "Unknown"}
                  </td>
                  <td className="px-lg py-lg text-body text-accent-500 font-semibold">
                    KES {formatKES(order.totalPriceKES || 0)}
                  </td>
                  <td className="px-lg py-lg text-body text-text-secondary">
                    {order.items.length} items
                  </td>
                  <td className="px-lg py-lg text-body text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}