"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { getNavigation, isCurrentPage } from "../lib/navigation-config";
import { SoleFinityLogo } from "./Logo";

interface UnifiedSidebarProps {
  session: Session | null;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

/**
 * Unified Sidebar Component
 * Single sidebar used across all dashboards (Admin, Staff, Distributor, Customer)
 * Responsive: collapses on mobile, fixed on desktop
 */
export function UnifiedSidebar({ session, isOpen = true, onClose, isMobile = false }: UnifiedSidebarProps) {
  const pathname = usePathname();
  
  const navigation = getNavigation(session?.user?.role);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className={`flex flex-col h-full bg-base-950 border-r border-base-800/50`}>
      {/* Header */}
      <div className="flex items-center justify-between p-lg border-b border-base-800/30 bg-gradient-to-b from-base-900 to-base-950">
        <div className="flex items-center gap-md">
          <SoleFinityLogo size="small" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-h4 text-white truncate bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-500">
              Groomers Cave
            </div>
            <div className="text-xs text-accent-400 font-semibold uppercase tracking-wide truncate">
              {session?.user?.role || "User"}
            </div>
          </div>
        </div>
        
        {/* Close button for mobile */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-md text-text-secondary hover:text-accent-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-md py-lg space-y-xs">
        {navigation.map((item) => {
          const active = isCurrentPage(pathname, item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              className={`flex items-center gap-lg px-lg py-md rounded-lg transition-all duration-200 group relative ${
                active
                  ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/20"
                  : "text-text-secondary hover:bg-base-800/60 hover:text-accent-400"
              }`}
              title={item.description}
            >
              <span className={`text-lg flex-shrink-0 transition-transform ${active ? "scale-110" : "group-hover:scale-105"}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-body truncate">{item.label}</p>
                {item.description && (
                  <p className={`text-xs truncate ${active ? "text-white/70" : "text-text-muted"}`}>
                    {item.description}
                  </p>
                )}
              </div>
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

      {/* User Section */}
      <div className="px-md py-lg space-y-xs">
        {/* User Info */}
        <div className="px-lg py-md rounded-lg bg-base-800/20 border border-base-800/50">
          <p className="text-xs text-text-muted uppercase font-semibold letter-spacing-1 mb-xs">Logged in as</p>
          <p className="text-sm font-bold text-text-primary truncate">{session?.user?.name}</p>
          <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-lg px-lg py-md rounded-lg text-text-secondary hover:bg-error/20 hover:text-error transition-all duration-200 group font-medium text-body"
        >
          <span className="text-lg">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

/**
 * UnifiedDashboardLayout - Main layout component for all dashboards
 * Combines navbar, sidebar, and content area
 * Responsive: mobile-first design
 */
export function UnifiedDashboardLayout({ 
  children, 
  title, 
  subtitle,
  headerAction 
}: { 
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-base-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <UnifiedSidebar
              session={session}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <UnifiedSidebar session={session} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-base-900/95 border-b border-base-800/50 backdrop-blur-sm">
          <div className="px-lg md:px-xl py-md md:py-lg">
            <div className="flex items-center justify-between gap-lg">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-md text-text-secondary hover:text-accent-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Title Section */}
              {(title || subtitle) && (
                <div className="flex-1 min-w-0">
                  {title && <h1 className="text-h2 md:text-h1 font-black text-white truncate">{title}</h1>}
                  {subtitle && <p className="text-body text-text-muted mt-xs">{subtitle}</p>}
                </div>
              )}

              {/* Header Action */}
              {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-lg md:p-xl max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
