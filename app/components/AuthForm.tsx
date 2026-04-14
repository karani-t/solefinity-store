"use client";

import React, { FormHTMLAttributes } from "react";
import Link from "next/link";

interface AuthFormProps extends FormHTMLAttributes<HTMLFormElement> {
  title: string;
  subtitle?: string;
  submitLabel: string;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
  bottomLink?: {
    text: string;
    href: string;
    label: string;
  };
}

export function AuthForm({
  title,
  subtitle,
  submitLabel,
  isLoading,
  error,
  children,
  bottomLink,
  ...props
}: AuthFormProps) {
  return (
    <div className="min-h-screen flex-center bg-base-950 py-xl">
      <div className="w-full max-w-md px-lg">
        {/* Card with Premium Styling */}
        <div className="card bg-gradient-to-b from-base-900 to-base-950 border border-base-800 shadow-xl">
          {/* Header */}
          <div className="text-center mb-xxxl pb-lg border-b border-base-800">
            <h1 className="text-h1 font-bold text-text-primary mb-md">{title}</h1>
            {subtitle && (
              <p className="text-body text-text-muted">{subtitle}</p>
            )}
          </div>

          {/* Error Alert - Premium Styling */}
          {error && (
            <div className="mb-lg p-lg rounded-lg bg-error/10 border border-error/30 backdrop-blur-sm animate-bounce-soft" aria-role="alert">
              <p className="text-body-sm text-error font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form {...props} className="space-y-lg">
            {children}

            {/* Submit Button - Premium */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full font-bold text-base hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="flex-center gap-md">
                  <div className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                submitLabel
              )}
            </button>
          </form>

          {/* Bottom Link */}
          {bottomLink && (
            <div className="mt-xl text-center text-body-sm text-text-secondary">
              {bottomLink.text}{" "}
              <Link
                href={bottomLink.href}
                className="text-accent-500 hover:text-accent-400 font-bold transition-colors duration-200"
              >
                {bottomLink.label}
              </Link>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="text-center mt-xl text-caption text-text-muted">
          <p className="font-semibold">Groomers Cave © 2026</p>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  hint,
  disabled,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-md">
      <label htmlFor={name} className="label font-semibold text-text-primary flex items-center gap-xs">
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`input focus-ring transition-all duration-200 ${error ? "input-error border-error/50" : "hover:border-base-600"} ${
          disabled ? "input-disabled opacity-50" : ""
        }`}
      />
      {error && (
        <p className="text-caption text-error font-medium">✖ {error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-text-muted">{hint}</p>
      )}
    </div>
  );
}

export { AuthForm as default };
