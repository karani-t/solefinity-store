"use client";

import Link from "next/link";
import React from "react";

// ═══════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: "accent" | "success" | "warning" | "error" | "info";
  trend?: { direction: "up" | "down"; percentage: number };
  description?: string;
}

export function StatCard({ label, value, icon, color = "accent", trend, description }: StatCardProps) {
  const colorMap = {
    accent: "from-accent-500/10 to-accent-500/5 border-accent-500/20",
    success: "from-success/10 to-success/5 border-success/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
    error: "from-error/10 to-error/5 border-error/20",
    info: "from-info/10 to-info/5 border-info/20",
  };

  const iconColorMap = {
    accent: "text-accent-500",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    info: "text-info",
  };

  return (
    <div className={`card bg-gradient-to-br ${colorMap[color]} p-lg md:p-xl`}>
      <div className="flex items-start justify-between gap-lg">
        <div className="flex-1">
          <p className="text-body text-text-secondary uppercase font-semibold letter-spacing-05 mb-md">{label}</p>
          <h3 className="text-display md:text-h1 font-black text-white mb-md">{value}</h3>
          {description && <p className="text-body-sm text-text-muted">{description}</p>}
        </div>
        
        {icon && (
          <div className={`text-4xl md:text-5xl flex-shrink-0 ${iconColorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-lg flex items-center gap-md">
          <span className={`text-sm font-bold ${trend.direction === "up" ? "text-success" : "text-error"}`}>
            {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
          </span>
          <p className="text-caption text-text-muted">vs last period</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// QUICK ACTION CARDS
// ═══════════════════════════════════════════════════════

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  color?: "accent" | "success" | "warning" | "error";
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  color = "accent",
}: QuickActionCardProps) {
  const colorMap = {
    accent: "group-hover:text-accent-400 text-accent-500",
    success: "group-hover:text-success text-success",
    warning: "group-hover:text-warning text-warning",
    error: "group-hover:text-error text-error",
  };

  return (
    <Link href={href}>
      <div className="card bg-gradient-to-br from-base-900 to-base-800 border border-base-800 hover:border-accent-500/50 transition-all duration-200 hover:shadow-lg group h-full flex flex-col items-start justify-start p-lg">
        {icon && (
          <div className={`text-3xl mb-lg transition-colors duration-200 ${colorMap[color]}`}>
            {icon}
          </div>
        )}
        <h3 className="text-h4 font-bold text-text-primary mb-md">{title}</h3>
        <p className="text-body-sm text-text-muted flex-1">{description}</p>
        <div className="text-xs text-accent-400 font-semibold mt-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          → Explore
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════
// RECENT ORDERS TABLE
// ═══════════════════════════════════════════════════════

interface OrderListProps {
  orders: Array<{
    id: string;
    orderNumber?: string;
    status: string;
    paymentStatus: string;
    totalPriceKES?: number;
    total?: number;
    createdAt: string;
    items?: Array<any>;
    customer?: { name?: string; email?: string };
  }>;
  emptyMessage?: string;
  onOrderClick?: (id: string) => void;
  maxRows?: number;
}

export function OrderList({ orders, emptyMessage = "No orders yet", onOrderClick, maxRows = 10 }: OrderListProps) {
  const displayOrders = orders.slice(0, maxRows);
  const hasMore = orders.length > maxRows;

  if (orders.length === 0) {
    return (
      <div className="card bg-base-900 border border-base-800 text-center py-xxxl px-lg">
        <p className="text-body text-text-muted mb-lg">📦 {emptyMessage}</p>
        <Link href="/orders" className="btn btn-primary text-sm">
          Browse Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-xs">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-5 gap-lg px-lg py-md bg-base-800/30 rounded-lg border border-base-800/50 font-bold text-body text-text-secondary uppercase text-caption letter-spacing-05">
        <div>Order ID</div>
        <div>Customer</div>
        <div>Status</div>
        <div>Total</div>
        <div>Date</div>
      </div>

      {/* Rows */}
      {displayOrders.map((order) => (
        <button
          key={order.id}
          onClick={() => onOrderClick?.(order.id)}
          className="card bg-base-900 border border-base-800 hover:border-accent-500/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 w-full text-left active:scale-95 group md:grid md:grid-cols-5 gap-lg md:py-md"
        >
          {/* Mobile layout */}
          <div className="md:hidden flex-between mb-md">
            <div>
              <p className="text-body font-bold text-text-primary group-hover:text-accent-400 transition-colors">
                #{order.orderNumber || order.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-caption text-text-muted">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-body font-bold text-accent-500">KES {(order.totalPriceKES || order.total || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden md:flex md:items-center">
            <p className="text-body font-bold text-text-primary truncate">#{order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="hidden md:flex md:items-center">
            <p className="text-body text-text-secondary truncate">{order.customer?.name || "Unknown"}</p>
          </div>
          <div className="hidden md:flex md:items-center">
            <span className={`badge text-caption font-semibold ${
              order.status === "DELIVERED"
                ? "badge-success"
                : order.status === "SHIPPED"
                ? "badge-accent"
                : order.status === "PROCESSING"
                ? "badge-warning"
                : "badge-error"
            }`}>
              {order.status}
            </span>
          </div>
          <div className="hidden md:flex md:items-center">
            <p className="text-body font-bold text-accent-500">KES {(order.totalPriceKES || order.total || 0).toLocaleString()}</p>
          </div>
          <div className="hidden md:flex md:items-center">
            <p className="text-caption text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Mobile badges */}
          <div className="md:hidden flex gap-md">
            <span className={`badge text-xs font-semibold ${
              order.status === "DELIVERED"
                ? "badge-success"
                : order.status === "SHIPPED"
                ? "badge-accent"
                : "badge-warning"
            }`}>
              {order.status}
            </span>
            <span className={`badge text-xs font-semibold ${
              order.paymentStatus === "PAID" ? "badge-success" : "badge-error"
            }`}>
              {order.paymentStatus}
            </span>
          </div>
        </button>
      ))}

      {/* View All Button */}
      {hasMore && (
        <Link href="/orders" className="btn btn-secondary w-full text-sm mt-lg">
          View All {orders.length} Orders →
        </Link>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card bg-base-900 border border-base-800 text-center py-xxxl px-lg">
      <div className="text-6xl mb-lg">{icon}</div>
      <h3 className="text-h3 font-bold text-text-primary mb-md">{title}</h3>
      {description && <p className="text-body text-text-muted mb-lg">{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn-primary text-sm">
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MESSAGE THREAD
// ═══════════════════════════════════════════════════════

interface Message {
  id: string;
  sender: string;
  senderRole?: string;
  content: string;
  createdAt: string;
  isOwn?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserEmail?: string;
}

export function MessageThread({ messages, currentUserEmail }: MessageThreadProps) {
  const scrollContainer = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-96 md:h-96 bg-base-900 border border-base-800 rounded-lg overflow-hidden">
      {/* Messages */}
      <div ref={scrollContainer} className="flex-1 overflow-y-auto p-lg space-y-md">
        {messages.length === 0 ? (
          <div className="flex-center h-full text-center">
            <div className="text-text-muted">
              <p className="text-lg">💬</p>
              <p className="text-sm mt-md">No messages yet. Start a conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-md ${msg.isOwn || msg.sender === currentUserEmail ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md p-md rounded-lg ${
                  msg.isOwn || msg.sender === currentUserEmail
                    ? "bg-accent-500/20 border border-accent-500/40 text-text-primary"
                    : "bg-base-800/50 border border-base-700/50 text-text-secondary"
                }`}
              >
                <p className="text-caption font-bold mb-xs text-accent-400">{msg.sender}</p>
                <p className="text-body break-words">{msg.content}</p>
                <p className="text-caption text-text-muted mt-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-base-800 p-md bg-base-800/30">
        <div className="flex gap-md">
          <input className="input flex-1" placeholder="Type your message..." />
          <button className="btn btn-primary px-lg">Send</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════

export function LoadingSpinner() {
  return (
    <div className="flex-center min-h-screen bg-base-950">
      <div className="spinner spinner-md" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════

export function SkeletonCard() {
  return (
    <div className="card bg-base-900 border border-base-800 p-lg">
      <div className="skeleton skeleton-text mb-md" />
      <div className="skeleton skeleton-text mb-md w-3/4" />
      <div className="skeleton skeleton-card h-20" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION HEADER
// ═══════════════════════════════════════════════════════

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex-between mb-lg">
      <div>
        <h2 className="text-h2 font-black text-white mb-xs">{title}</h2>
        {description && <p className="text-body text-text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn btn-secondary text-sm flex-shrink-0">
          {action.label} →
        </Link>
      )}
    </div>
  );
}
