"use client";

import React from "react";
import { useState } from "react";
import { useToast } from "./Toast";
import Image from "next/image";

// ═══════════════════════════════════════════════════════
// PROFILE PICTURE UPLOAD
// ═══════════════════════════════════════════════════════

interface ProfilePictureUploadProps {
  currentImage?: string;
  userName?: string;
  onUpload?: (file: File) => Promise<void>;
}

export function ProfilePictureUpload({ currentImage, userName = "User", onUpload }: ProfilePictureUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(currentImage || null);
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("File size must be less than 5MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file", "error");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    try {
      await onUpload?.(file);
      addToast("Profile picture updated successfully", "success");
    } catch (err) {
      addToast("Failed to upload profile picture", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-900 border border-base-800 p-lg">
      <h3 className="text-h4 font-bold text-white mb-lg">Profile Picture</h3>
      
      <div className="flex items-center gap-lg">
        {/* Current Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-500/30 bg-base-800 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn btn-primary text-sm mb-md w-full"
          >
            {loading ? "Uploading..." : "Choose Photo"}
          </button>
          <p className="text-caption text-text-muted">JPG, PNG or GIF (max 5MB)</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ACCOUNT INFO FORM
// ═══════════════════════════════════════════════════════

interface AccountInfoFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSubmit?: (data: any) => Promise<void>;
}

export function AccountInfoForm({ initialData, onSubmit }: AccountInfoFormProps) {
  const [formData, setFormData] = React.useState(initialData || {});
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.(formData);
      addToast("Account information updated", "success");
    } catch (err) {
      addToast("Failed to update account information", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-900 border border-base-800 p-lg space-y-lg">
      <h3 className="text-h4 font-bold text-white">Account Information</h3>

      <div className="space-y-md">
        {/* Full Name */}
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={(formData as any).name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="input"
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            value={(formData as any).email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="input"
            placeholder="your@email.com"
            disabled
          />
          <p className="text-caption text-text-muted mt-xs">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            value={(formData as any).phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="input"
            placeholder="+254 (7XX) XXX XXX"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════
// PASSWORD CHANGE FORM
// ═══════════════════════════════════════════════════════

interface PasswordChangeFormProps {
  onSubmit?: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
}

export function PasswordChangeForm({ onSubmit }: PasswordChangeFormProps) {
  const [formData, setFormData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must include uppercase, lowercase, number, and special character";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast("Please fix the errors below", "error");
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.(formData);
      addToast("Password updated successfully", "success");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      addToast("Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-900 border border-base-800 p-lg space-y-lg">
      <h3 className="text-h4 font-bold text-white">Change Password</h3>

      <div className="space-y-md">
        {/* Current Password */}
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className={`input pr-12 ${errors.currentPassword ? "input-error" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPasswords.current ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.currentPassword && <p className="text-caption text-error mt-xs">{errors.currentPassword}</p>}
        </div>

        {/* New Password */}
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className={`input pr-12 ${errors.newPassword ? "input-error" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPasswords.new ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.newPassword && <p className="text-caption text-error mt-xs">{errors.newPassword}</p>}
          <p className="text-caption text-text-muted mt-xs">Minimum 8 characters with uppercase, lowercase, number, and symbol</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`input pr-12 ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              {showPasswords.confirm ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-caption text-error mt-xs">{errors.confirmPassword}</p>}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════
// ACTIVITY SUMMARY
// ═══════════════════════════════════════════════════════

interface ActivitySummaryProps {
  lastLogin?: string;
  loginCount?: number;
  accountCreated?: string;
  accountStatus?: "active" | "inactive" | "suspended";
}

export function ActivitySummary({ lastLogin, loginCount = 0, accountCreated, accountStatus = "active" }: ActivitySummaryProps) {
  return (
    <div className="card bg-base-900 border border-base-800 p-lg">
      <h3 className="text-h4 font-bold text-white mb-lg">Account Activity</h3>

      <div className="space-y-md">
        {/* Status */}
        <div className="flex-between pb-md border-b border-base-800">
          <p className="text-body font-semibold text-text-secondary">Account Status</p>
          <span className={`badge ${
            accountStatus === "active" ? "badge-success" : accountStatus === "inactive" ? "badge-warning" : "badge-error"
          }`}>
            {accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)}
          </span>
        </div>

        {/* Last Login */}
        {lastLogin && (
          <div className="flex-between pb-md border-b border-base-800">
            <p className="text-body text-text-secondary">Last Login</p>
            <p className="text-body font-semibold text-text-primary">
              {new Date(lastLogin).toLocaleDateString()} {new Date(lastLogin).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Login Count */}
        <div className="flex-between pb-md border-b border-base-800">
          <p className="text-body text-text-secondary">Total Logins</p>
          <p className="text-body font-semibold text-accent-500">{loginCount}</p>
        </div>

        {/* Account Created */}
        {accountCreated && (
          <div className="flex-between">
            <p className="text-body text-text-secondary">Account Created</p>
            <p className="text-body font-semibold text-text-primary">{new Date(accountCreated).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
