import Link from "next/link";
import React from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  return (
    <div className="mb-xxxl pb-lg border-b border-base-800">
      {/* Heading */}
      <div className="flex-between gap-lg">
        <div className="flex-1">
          <div className="flex items-center gap-md mb-md">
            <h1 className="text-display-xl font-bold text-text-primary">{title}</h1>
            <div className="h-1 w-16 bg-gradient-to-r from-accent-500 to-accent-400/20 rounded-full"></div>
          </div>
          {description && (
            <p className="text-body text-text-muted max-w-xl">{description}</p>
          )}
        </div>
        {action && (
          <Link href={action.href} className="btn btn-primary hover:shadow-lg transition-all">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "accent" | "success" | "warning" | "error";
}

export function StatCard({ label, value, icon, trend, color = "accent" }: StatCardProps) {
  const colorMap = {
    accent: "bg-accent-500/10 text-accent-400",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    error: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="card bg-gradient-to-br from-base-900 to-base-800 border border-base-800 hover:border-accent-500/30 transition-all duration-200 hover:shadow-md">
      <div className="flex-between mb-lg">
        <p className="text-label text-text-muted uppercase letter-spacing-1 font-semibold">{label}</p>
        {icon && (
          <div className={`p-md rounded-lg ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-md">
        <p className="text-display-xl font-bold text-text-primary">{value}</p>
      </div>

      {trend && (
        <p className={`text-caption font-bold ${trend.isPositive ? 'text-success' : 'text-error'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last period
        </p>
      )}
    </div>
  );
}

interface AlertBoxProps {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function AlertBox({ type, title, message, action }: AlertBoxProps) {
  const styleMap = {
    info: "bg-accent-500/10 border-accent-500/30 text-accent-300",
    success: "bg-green-500/10 border-green-500/30 text-green-300",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    error: "bg-red-500/10 border-red-500/30 text-red-300",
  };

  return (
    <div className={`card border ${styleMap[type]}`}>
      <div className="flex-between mb-md">
        <h3 className="font-bold text-text-primary text-lg">{title}</h3>
      </div>
      <p className="text-body text-text-secondary mb-lg">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-sm btn-primary hover:shadow-md transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
