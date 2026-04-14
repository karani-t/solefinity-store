"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { SoleFinityLogo } from "@/app/components/Logo";
import { AuthForm, FormField } from "@/app/components/AuthForm";

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
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 tracking-tighter">
                GROOMERS<span className="text-yellow-400 block text-4xl">CAVE</span>
              </div>
            </Link>
            <p className="text-sm font-semibold text-amber-400 tracking-widest uppercase mt-3">
              Premium Men's Grooming & Luxury Lifestyle
            </p>
            <p className="text-gray-400 text-sm mt-4">
              Enter your world of premium style.
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm
            title="Welcome Back"
            subtitle="Sign in to your Groomers Cave account"
            error={error}
            isLoading={loading}
            onSubmit={handleSubmit}
            submitLabel="Sign In"
            bottomLink={{
              text: "Don't have an account?",
              label: "Join Groomers Cave",
              href: "/auth/signup",
            }}
          >
            {/* Email Field */}
            <FormField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
            />

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
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
          </AuthForm>

          {/* Security Notice */}
          <p className="text-center text-gray-500 text-xs mt-8">
            🔒 Your data is encrypted and secure. We never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}