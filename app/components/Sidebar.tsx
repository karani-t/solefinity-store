"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X, Home, BarChart3, Users, Settings, LogOut, User, Package, ShoppingCart, MessageSquare, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";
import { SoleFinityLogo } from "./Logo";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  isActive?: boolean;
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  let navItems: SidebarItem[] = [];

  // Role-specific navigation
  if (session?.user.role === "ADMIN") {
    navItems = [
      { label: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/admin" },
      { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/admin/analytics" },
      { label: "Staff", icon: <Users className="w-5 h-5" />, href: "/admin/staff" },
      { label: "Distributors", icon: <Package className="w-5 h-5" />, href: "/admin/distributors" },
      { label: "Products", icon: <ShoppingCart className="w-5 h-5" />, href: "/admin/products" },
      { label: "Reviews", icon: <BarChart3 className="w-5 h-5" />, href: "/admin/reviews" },
    ];
  } else if (session?.user.role === "STAFF") {
    navItems = [
      { label: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/dashboard/staff" },
      { label: "Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/dashboard/staff" },
      { label: "Reports", icon: <BarChart3 className="w-5 h-5" />, href: "/dashboard/staff/reports" },
      { label: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/staff" },
    ];
  } else if (session?.user.role === "DISTRIBUTOR") {
    navItems = [
      { label: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/dashboard/distributor" },
      { label: "Alerts", icon: <AlertTriangle className="w-5 h-5" />, href: "/dashboard/distributor" },
      { label: "Reports", icon: <BarChart3 className="w-5 h-5" />, href: "/dashboard/distributor/reports" },
      { label: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/distributor" },
    ];
  } else {
    navItems = [
      { label: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/dashboard/customer" },
      { label: "Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/orders" },
      { label: "Wishlist", icon: <ShoppingCart className="w-5 h-5" />, href: "/wishlist" },
      { label: "Profile", icon: <User className="w-5 h-5" />, href: "/dashboard/account" },
    ];
  }

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-200 md:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:z-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <SoleFinityLogo size="small" />
            <div>
              <div className="font-bold text-white">SoleFinity</div>
              <div className="text-xs text-gray-400 capitalize">{session?.user.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-slate-800/50"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-red-500 rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard/account"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800/50 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
          <button
            onClick={() => {
              closeSidebar();
              signOut({ callbackUrl: "/auth/signin" });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-950/30 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">
      <Sidebar />
      <main className="flex-1 md:ml-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
