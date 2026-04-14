"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { SoleFinityLogo } from "./Logo";

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="flex flex-wrap gap-4 items-center">
      <Link href="/" className="flex items-center gap-2 text-white font-bold hover:opacity-80 transition">
        <SoleFinityLogo size="small" />
        <span className="hidden sm:inline">SoleFinity</span>
      </Link>
      <Link href="/products" className="text-slate-200 hover:text-white font-semibold">Products</Link>
      <Link href="/cart" className="text-slate-200 hover:text-white font-semibold">Cart</Link>
      {session ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-emerald-300">Welcome, {session.user?.name}</span>
          <Link href="/orders" className="text-slate-200 hover:text-white">My Orders</Link>
          <Link href="/wishlist" className="text-slate-200 hover:text-white">Wishlist</Link>
          {session.user.role === "ADMIN" && (
            <Link href="/admin" className="text-slate-200 hover:text-white">Admin</Link>
          )}
          {session.user.role === "STAFF" && (
            <Link href="/dashboard/staff" className="text-slate-200 hover:text-white">Staff</Link>
          )}
          {session.user.role === "DISTRIBUTOR" && (
            <Link href="/dashboard/distributor" className="text-slate-200 hover:text-white">Distributor</Link>
          )}
          <button
            onClick={() => signOut()}
            className="text-rose-300 hover:text-rose-100 font-semibold"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/signin" className="text-slate-200 hover:text-white">Sign In</Link>
          <Link href="/auth/signup" className="text-slate-200 hover:text-white">Sign Up</Link>
        </div>
      )}
    </nav>
  );
}