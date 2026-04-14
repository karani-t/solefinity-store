import Link from "next/link";
import React from "react";

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
  }>;
  emptyMessage?: string;
  onOrderClick?: (id: string) => void;
}

export function OrderList({ orders, emptyMessage = "No orders yet", onOrderClick }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="card bg-base-900 border border-base-800 text-center py-xxxl px-lg">
        <p className="text-body text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-xs">
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => onOrderClick?.(order.id)}
          className="card bg-base-900 border border-base-800 hover:border-accent-500/50 transition-all duration-200 hover:shadow-md w-full text-left flex-between p-lg active:scale-95 group"
        >
          <div>
            <p className="text-body font-bold text-text-primary group-hover:text-accent-400 transition-colors duration-200">
              Order #{order.orderNumber || order.id.slice(-8)}
            </p>
            <p className="text-caption text-text-muted mt-xs">
              {new Date(order.createdAt).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "short", 
                day: "numeric" 
              })}
            </p>
          </div>

          <div className="text-right">
            <p className="text-body font-bold text-accent-500">
              KES {(order.totalPriceKES || order.total || 0).toLocaleString()}
            </p>
            <div className="flex gap-md mt-md justify-end">
              <span
                className={`badge text-caption font-semibold ${
                  order.status === "DELIVERED"
                    ? "badge-success"
                    : order.status === "SHIPPED"
                    ? "badge-accent"
                    : "badge-warning"
                }`}
              >
                {order.status}
              </span>
              <span
                className={`badge text-caption font-semibold ${
                  order.paymentStatus === "PAID" ? "badge-success" : "badge-error"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex-center min-h-screen bg-base-950">
      <div className="spinner spinner-md" />
    </div>
  );
}
