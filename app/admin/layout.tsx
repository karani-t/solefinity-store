"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      redirect("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
    </div>;
  }

  // Admin navigation
  const navigation = [
    { label: "Dashboard", href: "/admin", icon: "🏠", description: "Overview & Analytics" },
    { label: "Staff", href: "/admin/staff", icon: "👥", description: "Manage Staff" },
    { label: "Distributors", href: "/admin/distributors", icon: "🏪", description: "Manage Distributors" },
    { label: "Products", href: "/admin/products", icon: "👟", description: "Product Management" },
    { label: "Reviews", href: "/admin/reviews", icon: "⭐", description: "Customer Reviews" },
    { label: "Analytics", href: "/admin/analytics", icon: "📊", description: "Reports & Insights" },
    { label: "Warehouses", href: "/admin/warehouses", icon: "🏭", description: "Warehouse Management" },
    { label: "Account", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-purple-700/40">
            <AdminSidebarContent navigation={navigation} session={session} isActive={isActive} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-sm border-r border-purple-700/40">
          <AdminSidebarContent navigation={navigation} session={session} isActive={isActive} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <nav className="bg-slate-900/80 border-b border-purple-700/40 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-300 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo */}
              <Link href="/" className="font-bold text-xl text-white hover:text-purple-300 transition">
                SoleFinity Admin
              </Link>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Role Badge */}
                <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 bg-red-600/40 border border-red-500/60 text-red-200 rounded-full">
                  {session?.user?.role}
                </span>

                {/* User menu */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-white font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-400">{session?.user?.email}</p>
                  </div>
                  <Link
                    href="/api/auth/signout"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Sign Out
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebarContent({ navigation, session, isActive, onClose }: {
  navigation: any[];
  session: any;
  isActive: (href: string) => boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-purple-700/40">
        <Link href="/admin" className="font-bold text-xl text-white hover:text-purple-300 transition">
          Admin Panel
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-purple-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-600 flex items-center justify-center">
            <span className="text-lg">👑</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            <span className="inline-flex text-xs font-semibold px-2 py-1 bg-red-600/40 border border-red-500/60 text-red-200 rounded-full mt-1">
              {session?.user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
              isActive(item.href)
                ? "bg-red-600/20 border border-red-500/40 text-red-200"
                : "text-gray-300 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              {item.description && (
                <p className="text-xs text-gray-400">{item.description}</p>
              )}
            </div>
            {isActive(item.href) && (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-purple-700/40">
        <div className="space-y-2">
          <Link
            href="/dashboard/staff"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition p-2 rounded hover:bg-slate-800/50"
          >
            <span>👥</span>
            Switch to Staff View
          </Link>
          <Link
            href="/dashboard/customer"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition p-2 rounded hover:bg-slate-800/50"
          >
            <span>🛍️</span>
            Switch to Customer View
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-700/40">
        <div className="text-xs text-gray-400 text-center">
          <p>© 2026 SoleFinity Admin</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </>
  );
}