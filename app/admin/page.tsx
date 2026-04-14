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

      {/* Quick Actions - Management Cards */}
      <div>
        <div className="flex items-center gap-md mb-lg">
          <h2 className="text-h2 font-bold text-text-primary">Quick Access</h2>
          <span className="text-xs uppercase letter-spacing-1 text-text-muted font-semibold">Management</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {[
            {
              label: "Products",
              href: "/admin/products",
              icon: <Package className="w-6 h-6" />,
              description: "Manage inventory",
            },
            {
              label: "Staff",
              href: "/admin/staff",
              icon: <Users className="w-6 h-6" />,
              description: "Team management",
            },
            {
              label: "Distributors",
              href: "/admin/distributors",
              icon: <TrendingUp className="w-6 h-6" />,
              description: "Partner network",
            },
            {
              label: "Reviews",
              href: "/admin/reviews",
              icon: <AlertTriangle className="w-6 h-6" />,
              description: "Content moderation",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group card bg-gradient-to-br from-base-900 to-base-800 border border-base-800 hover:border-accent-500/50 transition-all duration-200 hover:shadow-lg flex flex-col p-lg"
            >
              <div className="mb-lg text-accent-500 group-hover:text-accent-400 transition-colors duration-200">
                {item.icon}
              </div>
              <h3 className="text-h4 font-bold text-text-primary mb-xs">{item.label}</h3>
              <p className="text-body-xs text-text-muted">{item.description}</p>
              <div className="flex-1" />
              <div className="text-xs text-accent-400 font-semibold mt-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                → Open
              </div>
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

      {/* Recent Orders Table - Premium Layout */}
      <div>
        <div className="flex items-center justify-between gap-lg mb-lg">
          <h2 className="text-h2 font-bold text-text-primary">Recent Orders</h2>
          <Link href="/admin/analytics" className="text-accent-500 hover:text-accent-400 text-sm font-semibold transition-colors duration-200">
            View All Orders →
          </Link>
        </div>
        <div className="card bg-base-900 border border-base-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-base-800 to-base-800/50 border-b border-base-800">
                <tr>
                  <th className="text-label text-text-muted text-left px-lg py-md font-bold uppercase letter-spacing-1 text-xs">Order ID</th>
                  <th className="text-label text-text-muted text-left px-lg py-md font-bold uppercase letter-spacing-1 text-xs">Customer</th>
                  <th className="text-label text-text-muted text-left px-lg py-md font-bold uppercase letter-spacing-1 text-xs">Amount</th>
                  <th className="text-label text-text-muted text-left px-lg py-md font-bold uppercase letter-spacing-1 text-xs">Items</th>
                  <th className="text-label text-text-muted text-left px-lg py-md font-bold uppercase letter-spacing-1 text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-800">
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="hover:bg-base-800/40 transition-colors duration-150 group"
                  >
                    <td className="px-lg py-lg text-body text-accent-400 font-mono font-semibold group-hover:text-accent-300 transition-colors">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-lg py-lg text-body text-text-primary font-medium">
                      {order.user?.email || "Unknown"}
                    </td>
                    <td className="px-lg py-lg text-body font-bold">
                      <span className="text-accent-500">KES {formatKES(order.totalPriceKES || 0)}</span>
                    </td>
                    <td className="px-lg py-lg text-body text-text-secondary">
                      <span className="inline-block px-md py-xs bg-base-800 rounded text-text-primary font-medium">{order.items.length}</span>
                    </td>
                    <td className="px-lg py-lg text-body text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}