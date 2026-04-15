/**
 * Unified Navigation Configuration
 * Single source of truth for all role-based navigation
 * Used across all dashboards and layouts
 */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string | number;
  enabled?: boolean;
}

export const NAVIGATION_CONFIG = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "📊", description: "Overview & Analytics" },
    { label: "Analytics", href: "/admin/analytics", icon: "📈", description: "Reports & Insights" },
    { label: "Staff", href: "/admin/staff", icon: "👥", description: "Manage Staff" },
    { label: "Distributors", href: "/admin/distributors", icon: "🏪", description: "Manage Distributors" },
    { label: "Products", href: "/admin/products", icon: "👟", description: "Product Management" },
    { label: "Reviews", href: "/admin/reviews", icon: "⭐", description: "Customer Reviews" },
    { label: "Messages", href: "/admin/messages", icon: "💬", description: "Internal Messaging" },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: "🔍", description: "System Audit Logs" },
    { label: "Settings", href: "/dashboard/account", icon: "⚙️", description: "Profile & Settings" },
  ] as NavItem[],

  STAFF: [
    { label: "Dashboard", href: "/dashboard/staff", icon: "📊", description: "Overview & Stats" },
    { label: "Orders", href: "/dashboard/staff", icon: "📦", description: "Manage Orders" },
    { label: "Products", href: "/products", icon: "👟", description: "Browse Products" },
    { label: "Messages", href: "/dashboard/staff", icon: "💬", description: "Internal Messaging" },
    { label: "Reports", href: "/dashboard/staff/reports", icon: "📈", description: "Performance Reports" },
    { label: "Settings", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
  ] as NavItem[],

  DISTRIBUTOR: [
    { label: "Dashboard", href: "/dashboard/distributor", icon: "📊", description: "Overview" },
    { label: "Orders", href: "/dashboard/distributor", icon: "📦", description: "Order History" },
    { label: "Messaging", href: "/dashboard/distributor", icon: "💬", description: "Internal Messaging" },
    { label: "Products", href: "/products", icon: "👟", description: "Browse Catalog" },
    { label: "Reports", href: "/dashboard/distributor/reports", icon: "📈", description: "Analytics Reports" },
    { label: "Settings", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
  ] as NavItem[],

  CUSTOMER: [
    { label: "Dashboard", href: "/dashboard/customer", icon: "📊", description: "Overview" },
    { label: "Shop", href: "/products", icon: "🛍️", description: "Browse Products" },
    { label: "Orders", href: "/orders", icon: "📦", description: "Order History" },
    { label: "Wishlist", href: "/wishlist", icon: "❤️", description: "Saved Items" },
    { label: "Cart", href: "/cart", icon: "🛒", description: "Shopping Cart" },
    { label: "Settings", href: "/dashboard/account", icon: "⚙️", description: "Profile Settings" },
  ] as NavItem[],
};

export function getNavigation(role?: string): NavItem[] {
  if (!role) return [];
  const nav = NAVIGATION_CONFIG[role as keyof typeof NAVIGATION_CONFIG];
  return nav || [];
}

export function isCurrentPage(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
