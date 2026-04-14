"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";

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
              <p className="text-fuchsia-300 font-semibold mb-6 break-all">{email}</p>
              <p className="text-sm text-gray-400 mb-8">
                The link will expire in <span className="text-fuchsia-300 font-semibold">1 hour</span>. If you don't see the email, check your spam folder.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:from-fuchsia-700 group-hover:to-pink-700 transition-all"></div>
                <div className="relative flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Sign In
                </div>
              </Link>
            </div>
          ) : (
            // Form State
            <div className="backdrop-blur-xl bg-gradient-to-b from-slate-900/50 to-slate-950/50 border border-purple-900/30 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-2 tracking-tight">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-8">
                Enter your email and we'll send you a link to create a new password.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 rounded-lg flex items-start gap-3">
                  <div className="text-red-400 mt-0.5">⚠</div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full relative overflow-hidden group mt-8 py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:from-fuchsia-700 group-hover:to-pink-700 transition-all disabled:from-fuchsia-700 disabled:to-pink-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl disabled:opacity-0"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-center text-gray-400 text-sm">
                  Remember your password?{" "}
                  <Link href="/auth/signin" className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
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
