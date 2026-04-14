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
        className="fixed top-lg left-lg z-50 p-md rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-all duration-200 md:hidden shadow-lg hover:shadow-xl active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay - Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-200"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar - Premium SaaS Style */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-base-950 border-r border-base-800/50 transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:z-0 flex flex-col`}
      >
        {/* Header - Logo & Branding */}
        <div className="px-lg py-xl border-b border-base-800/30 bg-gradient-to-b from-base-900 to-base-950">
          <div className="flex items-center gap-md">
            <div className="flex-shrink-0">
              <SoleFinityLogo size="small" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-h4 text-white truncate">Groomers Cave</div>
              <div className="text-xs text-accent-400 font-semibold uppercase letter-spacing-1 truncate">{session?.user.role || "User"}</div>
            </div>
          </div>
        </div>

        {/* Navigation - Clean Hierarchy */}
        <nav className="flex-1 overflow-y-auto px-md py-lg space-y-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-lg px-lg py-md rounded-md transition-all duration-200 group ${
                  isActive
                    ? "bg-accent-500 text-white shadow-md"
                    : "text-text-secondary hover:bg-base-800/60 hover:text-text-primary active:scale-95"
                }`}
              >
                <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "text-white" : "text-text-muted group-hover:text-text-primary"}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-body flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="flex-shrink-0 text-xs bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-md">
          <div className="h-px bg-base-800/30"></div>
        </div>

        {/* Footer - User Actions */}
        <div className="px-md py-lg space-y-xs">
          <Link
            href="/dashboard/account"
            onClick={closeSidebar}
            className="flex items-center gap-lg px-lg py-md rounded-md text-text-secondary hover:bg-base-800/60 hover:text-text-primary transition-all duration-200 group active:scale-95"
          >
            <User className="w-5 h-5 flex-shrink-0 text-text-muted group-hover:text-accent-400" />
            <span className="font-medium text-body">Profile</span>
          </Link>
          <button
            onClick={() => {
              closeSidebar();
              signOut({ callbackUrl: "/auth/signin" });
            }}
            className="w-full flex items-center gap-lg px-lg py-md rounded-md text-text-secondary hover:bg-red-950/30 hover:text-error transition-all duration-200 group active:scale-95"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-text-muted group-hover:text-error" />
            <span className="font-medium text-body">Sign Out</span>
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
      <main className="flex-1 flex flex-col bg-base-950">
        <div className="flex-1 overflow-y-auto px-lg md:px-xl py-lg md:py-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
