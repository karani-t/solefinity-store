import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatKES } from "../lib/currency";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/customer");
  }

  const orders = await prisma.order.findMany({
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
  });

  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: prisma.product.fields.lowStockThreshold,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-purple-300">Admin Dashboard</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-8">Admin Dashboard</h1>

        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/admin/products"
            className="from-pink-500 to-purple-500 bg-gradient-to-r text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-2xl"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/staff"
            className="from-emerald-400 to-teal-500 bg-gradient-to-r text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-2xl"
          >
            Staff Management
          </Link>
          <Link
            href="/admin/distributors"
            className="from-indigo-500 to-blue-500 bg-gradient-to-r text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-2xl"
          >
            Distributor Management
          </Link>
          <Link
            href="/admin/analytics"
            className="from-amber-500 to-orange-500 bg-gradient-to-r text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-2xl"
          >
            View Analytics
          </Link>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-black/40 border border-red-500/40 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-pink-300 mb-4">Low Stock Alerts</h2>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="font-medium text-white">{product.name}</span>
                  <span className="text-red-300">Stock: {product.stock} (Threshold: {product.lowStockThreshold})</span>
                </div>
              ))}
            </div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-500 transition">
              Notify Distributors
            </button>
          </div>
        )}

        <div className="bg-black/30 border border-indigo-500/20 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-indigo-600/40">
            <h2 className="text-xl font-semibold text-cyan-300">Recent Orders</h2>
          </div>
          <div className="divide-y divide-indigo-600/30">
            {orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-slate-300">Customer: {order.user.name}</p>
                    <p className="text-sm text-slate-300">Status: {order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-300">KES {formatKES(order.totalPriceKES || 0)}</p>
                    <p className="text-sm text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-300">Items:</p>
                  <ul className="text-sm text-slate-200">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product.name} x{item.quantity} - KES {formatKES(item.priceKES || 0)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}