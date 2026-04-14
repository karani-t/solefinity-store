"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { SoleFinityLogo } from "@/app/components/Logo";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Fetch session to get user role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      
      if (session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER") {
        router.push("/admin");
      } else if (session?.user?.role === "STAFF") {
        router.push("/dashboard/staff");
      } else if (session?.user?.role === "DISTRIBUTOR") {
        router.push("/dashboard/distributor");
      } else {
        router.push("/dashboard/customer");
      }
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
              <div className="flex items-center justify-center gap-3 mb-6">
                <SoleFinityLogo size="large" />
              </div>
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-pink-300 to-purple-300 tracking-tighter">
                SOLE<span className="text-cyan-300">FINITY</span>
              </div>
            </Link>
            <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mt-3">
              Premium Streetwear Hub
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Step into your vibe. Connect with your crew.
            </p>
          </div>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-gradient-to-b from-slate-900/50 to-slate-950/50 border border-purple-900/30 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-8">Sign in to your SoleFinity account</p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 rounded-lg flex items-start gap-3">
                <div className="text-red-400 mt-0.5">⚠</div>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all disabled:opacity-50"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group mt-8 py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 group-hover:from-fuchsia-700 group-hover:to-pink-700 transition-all"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-center text-gray-400 text-sm mb-4">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold transition-colors">
                  Join SoleFinity
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="w-8 h-px bg-gradient-to-r from-transparent to-slate-700"></span>
                <span>Continue with provided credentials</span>
                <span className="w-8 h-px bg-gradient-to-l from-transparent to-slate-700"></span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <p className="text-center text-gray-500 text-xs mt-8">
            🔒 Your data is encrypted and secure. We never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}