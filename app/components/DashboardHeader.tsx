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
    <div className="mb-xxxl">
      {/* Heading */}
      <div className="flex-between gap-lg mb-md">
        <div>
          <h1 className="text-display-xl font-bold text-text-primary">{title}</h1>
          {description && (
            <p className="text-body-lg text-text-secondary mt-md">{description}</p>
          )}
        </div>
        {action && (
          <Link href={action.href} className="btn btn-primary">
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
    accent: "bg-accent-900 text-accent-300",
    success: "bg-green-900 text-green-300",
    warning: "bg-yellow-900 text-yellow-300",
    error: "bg-red-900 text-red-300",
  };

  return (
    <div className="card-lg">
      <div className="flex-between mb-lg">
        <p className="text-label text-text-muted">{label}</p>
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
        <p className={`text-caption font-semibold ${trend.isPositive ? 'text-success' : 'text-error'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
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
    info: "bg-accent-900/30 border-accent-700 text-accent-300",
    success: "bg-green-900/30 border-green-700 text-green-300",
    warning: "bg-yellow-900/30 border-yellow-700 text-yellow-300",
    error: "bg-red-900/30 border-red-700 text-red-300",
  };

  return (
    <div className={`card-lg border ${styleMap[type]}`}>
      <div className="flex-between mb-md">
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>
      <p className="text-body text-text-secondary mb-lg">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-sm btn-secondary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
