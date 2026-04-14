"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { AuthForm } from "@/app/components/AuthForm";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid or missing reset token");
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin?message=Password reset successful. Sign in with your new password.");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo & Header */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
                <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-300 tracking-tighter">
                  SOLE<span className="text-cyan-300">FINITY</span>
                </div>
              </Link>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-b from-red-900/30 to-red-950/40 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-red-300">Invalid Link</h2>
              <p className="text-gray-300 mb-6">
                The password reset link is invalid or has expired. Please try requesting a new one.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-pink-600 group-hover:from-accent-700 group-hover:to-pink-700 transition-all"></div>
                <div className="relative flex items-center gap-2">
                  Request New Link
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo & Header */}
            <div className="text-center mb-12">
              <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
                <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-300 tracking-tighter">
                  SOLE<span className="text-cyan-300">FINITY</span>
                </div>
              </Link>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-b from-emerald-900/30 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Password Reset Successful</h2>
              <p className="text-gray-300 mb-2">Your password has been reset successfully.</p>
              <p className="text-sm text-gray-400">Redirecting to sign in page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-300 tracking-tighter">
                SOLE<span className="text-cyan-300">FINITY</span>
              </div>
            </Link>
            <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mt-3">
              Premium Streetwear Hub
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm
            title="Create New Password"
            subtitle="Enter a strong new password for your account"
            error={error}
            isLoading={loading}
            onSubmit={handleSubmit}
            submitLabel="Reset Password"
            bottomLink={{
              text: "Remember your password?",
              label: "Sign in",
              href: "/auth/signin",
            }}
          >
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </AuthForm>
        </div>
      </div>
    </div>
  );
}
