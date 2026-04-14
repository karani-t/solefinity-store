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
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-lg">
          {/* Header */}
          <div className="text-center mb-xxxl">
            <h1 className="text-h1 font-bold text-text-primary mb-md">{title}</h1>
            {subtitle && (
              <p className="text-body text-text-secondary">{subtitle}</p>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-lg p-lg rounded-lg bg-error/10 border border-error/30 animate-bounce-soft" aria-role="alert">
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          {/* Form */}
          <form {...props} className="space-y-lg">
            {children}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full hover:scale-102 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex-center gap-md">
                  <div className="spinner spinner-sm" />
                  <span>Loading...</span>
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
                className="text-accent-500 hover:text-accent-400 font-semibold"
              >
                {bottomLink.label}
              </Link>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="text-center mt-xl text-caption text-text-muted">
          <p>SoleFinity © 2026</p>
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
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-error ml-xs">*</span>}
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
        className={`input focus-ring ${error ? "input-error" : ""} ${
          disabled ? "input-disabled" : ""
        }`}
      />
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-text-muted">{hint}</p>
      )}
    </div>
  );
}

export { AuthForm as default };
