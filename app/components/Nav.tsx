"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { SoleFinityLogo } from "./Logo";
import { useState } from "react";

export default function Nav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClasses = "text-text-secondary hover:text-accent-400 font-semibold transition-colors duration-smooth relative group";
  const afterUnderline = "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-accent-500 after:to-accent-400 after:w-0 group-hover:after:w-full after:transition-all after:duration-300";

  return (
    <nav className="flex items-center justify-between w-full gap-4 sm:gap-8">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 text-white font-bold hover:opacity-90 transition-opacity flex-shrink-0">
        <SoleFinityLogo size="small" />
        <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-500 font-black text-lg">GROOMERS CAVE</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-wrap items-center gap-6">
        <Link href="/products" className={`${navLinkClasses} ${afterUnderline}`}>Products</Link>
        <Link href="/cart" className={`${navLinkClasses} ${afterUnderline}`}>Cart</Link>
        
        {session ? (
          <div className="flex flex-wrap items-center gap-4 pl-6 border-l border-base-800">
            <Link href="/orders" className={`${navLinkClasses} ${afterUnderline}`}>Orders</Link>
            <Link href="/wishlist" className={`${navLinkClasses} ${afterUnderline}`}>Wishlist</Link>
            
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className={`${navLinkClasses} ${afterUnderline}`}>Admin</Link>
            )}
            {session.user.role === "STAFF" && (
              <Link href="/dashboard/staff" className={`${navLinkClasses} ${afterUnderline}`}>Staff</Link>
            )}
            {session.user.role === "DISTRIBUTOR" && (
              <Link href="/dashboard/distributor" className={`${navLinkClasses} ${afterUnderline}`}>Distributor</Link>
            )}
            
            <button
              onClick={() => signOut()}
              className="text-error hover:text-red-400 font-semibold transition-colors duration-smooth"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex gap-3 pl-6 border-l border-base-800">
            <Link href="/auth/signin" className="px-4 py-2 text-text-secondary hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-300">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-text-secondary hover:text-accent-400 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-base-900 border-b border-base-800 md:hidden p-4 space-y-3 animate-slide-up">
          <Link href="/products" className="block text-text-secondary hover:text-accent-400 font-semibold">Products</Link>
          <Link href="/cart" className="block text-text-secondary hover:text-accent-400 font-semibold">Cart</Link>
          
          {session ? (
            <>
              <Link href="/orders" className="block text-text-secondary hover:text-accent-400 font-semibold">Orders</Link>
              <Link href="/wishlist" className="block text-text-secondary hover:text-accent-400 font-semibold">Wishlist</Link>
              {session.user.role === "ADMIN" && <Link href="/admin" className="block text-text-secondary hover:text-accent-400 font-semibold">Admin</Link>}
              {session.user.role === "STAFF" && <Link href="/dashboard/staff" className="block text-text-secondary hover:text-accent-400 font-semibold">Staff</Link>}
              {session.user.role === "DISTRIBUTOR" && <Link href="/dashboard/distributor" className="block text-text-secondary hover:text-accent-400 font-semibold">Distributor</Link>}
              <button onClick={() => signOut()} className="block w-full text-left text-error hover:text-red-400 font-semibold">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="block text-text-secondary hover:text-accent-400 font-semibold">Sign In</Link>
              <Link href="/auth/signup" className="block px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-lg text-center">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}