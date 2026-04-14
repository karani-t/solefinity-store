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
      <div className="card-interactive group h-full flex flex-col items-start justify-start">
        {icon && (
          <div className={`text-h2 mb-lg transition-smooth ${colorMap[color]}`}>
            {icon}
          </div>
        )}
        <h3 className="text-h4 font-semibold text-text-primary mb-md">{title}</h3>
        <p className="text-body-sm text-text-secondary">{description}</p>
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
      <div className="card-lg text-center py-xxxl">
        <p className="text-body text-text-secondary mb-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => onOrderClick?.(order.id)}
          className="card-interactive w-full text-left flex-between"
        >
          <div>
            <p className="text-body font-semibold text-text-primary">
              Order #{order.orderNumber || order.id.slice(-8)}
            </p>
            <p className="text-caption text-text-muted mt-xs">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-body font-bold text-accent-500">
              KES {(order.totalPriceKES || order.total || 0).toLocaleString()}
            </p>
            <div className="flex gap-md mt-md justify-end">
              <span
                className={`badge text-caption ${
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
                className={`badge text-caption ${
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
