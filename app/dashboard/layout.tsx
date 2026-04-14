"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    // Redirect based on role
    if (session.user.role === "STAFF") {
      // Don't redirect from staff dashboard
    } else if (session.user.role === "DISTRIBUTOR") {
      // Don't redirect from distributor dashboard
    } else if (session.user.role === "CUSTOMER") {
      // Don't redirect from customer dashboard
    } else if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
      router.push("/admin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
    </div>;
  }

  // Get role-specific navigation
  const getRoleNavigation = () => {
    const baseNav = [
      { label: "Dashboard", href: `/dashboard/${session?.user.role.toLowerCase()}`, icon: "🏠" },
      { label: "Account", href: "/dashboard/account", icon: "👤" },
    ];

    if (session?.user.role === "STAFF") {
      return [
        { label: "Dashboard", href: "/dashboard/staff", icon: "🏠", description: "Overview & Stats" },
        { label: "Orders", href: "/api/orders", icon: "📦", description: "Manage Orders" },
        { label: "Products", href: "/products", icon: "👟", description: "Browse Products" },
        { label: "Account", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
      ];
    } else if (session?.user.role === "DISTRIBUTOR") {
      return [
        { label: "Dashboard", href: "/dashboard/distributor", icon: "🏠", description: "Overview" },
        { label: "My Orders", href: "/api/distributor/orders", icon: "📦", description: "Order History" },
        { label: "Products", href: "/products", icon: "👟", description: "Browse Catalog" },
        { label: "Account", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
      ];
    } else if (session?.user.role === "CUSTOMER") {
      return [
        { label: "Dashboard", href: "/dashboard/customer", icon: "🏠", description: "Overview" },
        { label: "Shop", href: "/products", icon: "🛍️", description: "Browse Products" },
        { label: "Orders", href: "/orders", icon: "📦", description: "Order History" },
        { label: "Wishlist", href: "/wishlist", icon: "❤️", description: "Saved Items" },
        { label: "Cart", href: "/cart", icon: "🛒", description: "Shopping Cart" },
        { label: "Account", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
      ];
    }

    return baseNav;
  };

  const navigation = getRoleNavigation();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-purple-700/40">
            <SidebarContent navigation={navigation} session={session} isActive={isActive} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-sm border-r border-purple-700/40">
          <SidebarContent navigation={navigation} session={session} isActive={isActive} />
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
                Groomers Cave
              </Link>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Role Badge */}
                <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 bg-purple-600/40 border border-purple-500/60 text-purple-200 rounded-full">
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

function SidebarContent({ navigation, session, isActive, onClose }: {
  navigation: any[];
  session: any;
  isActive: (href: string) => boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-purple-700/40">
        <Link href="/" className="font-bold text-xl text-white hover:text-purple-300 transition">
          SoleFinity
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-purple-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            <span className="inline-flex text-xs font-semibold px-2 py-1 bg-purple-600/40 border border-purple-500/60 text-purple-200 rounded-full mt-1">
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
                ? "bg-purple-600/20 border border-purple-500/40 text-purple-200"
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
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-700/40">
        <div className="text-xs text-gray-400 text-center">
          <p>© 2026 Groomers Cave</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </>
  );
}
