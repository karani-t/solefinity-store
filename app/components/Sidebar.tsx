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
      {/* Toggle Button - Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-lg left-lg z-50 p-md rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-smooth md:hidden shadow-md"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay - Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-primary border-r border-base-800 transform transition-transform duration-fluid z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:z-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-lg border-b border-base-800">
          <div className="flex items-center gap-md">
            <SoleFinityLogo size="small" />
            <div>
              <div className="font-semibold text-text-primary">SoleFinity</div>
              <div className="text-caption text-text-muted uppercase">{session?.user.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-md space-y-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-md px-lg py-md rounded-lg transition-smooth ${
                  isActive
                    ? "bg-accent-500 text-white shadow-md scale-105"
                    : "text-text-secondary hover:bg-base-800 hover:text-text-primary hover:scale-102 active:scale-95"
                }`}
              >
                {item.icon}
                <span className="font-medium text-body">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-error text-white rounded-full px-md py-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-md border-t border-base-800 space-y-xs">
          <Link
            href="/dashboard/account"
            onClick={closeSidebar}
            className="flex items-center gap-md px-lg py-md rounded-lg text-text-secondary hover:bg-base-800 hover:text-text-primary transition-smooth hover:scale-102 active:scale-95"
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-body">Profile</span>
          </Link>
          <button
            onClick={() => {
              closeSidebar();
              signOut({ callbackUrl: "/auth/signin" });
            }}
            className="w-full flex items-center gap-md px-lg py-md rounded-lg text-error hover:bg-red-950/20 transition-smooth text-body font-medium hover:scale-102 active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-lg md:p-xl overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
