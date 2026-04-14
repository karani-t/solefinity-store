"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { AuthForm, FormField } from "@/app/components/AuthForm";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send password reset email");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

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

          {success ? (
            // Success State
            <div className="backdrop-blur-xl bg-gradient-to-b from-emerald-900/30 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-400/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Check Your Email</h2>
              <p className="text-gray-300 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="text-accent-300 font-semibold mb-6 break-all">{email}</p>
              <p className="text-sm text-gray-400 mb-8">
                The link will expire in <span className="text-accent-300 font-semibold">1 hour</span>. If you don't see the email, check your spam folder.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-pink-600 group-hover:from-accent-700 group-hover:to-pink-700 transition-all"></div>
                <div className="relative flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Sign In
                </div>
              </Link>
            </div>
          ) : (
            // Form State
            <AuthForm
              title="Reset Password"
              subtitle="Enter your email and we'll send you a link to create a new password."
              error={error}
              isLoading={loading}
              onSubmit={handleSubmit}
              submitLabel="Send Reset Link"
              bottomLink={{
                text: "Remember your password?",
                label: "Sign In",
                href: "/auth/signin",
              }}
            >
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                required
              />
            </AuthForm>
          )}

          {/* Security Notice */}
          <p className="text-center text-gray-500 text-xs mt-8">
            🔒 Your data is encrypted and secure. We never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}
