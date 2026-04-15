"use client";

import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import Nav from "./components/Nav";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";

async function getProducts() {
  const baseUrl = process.env.NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}

const CATEGORIES = [
  { name: "Shoes", icon: "👟" },
  { name: "Designer Perfumes", icon: "🏆" },
  { name: "Body Sprays", icon: "💨" },
  { name: "Pocket Perfumes", icon: "💼" },
  { name: "Smart Collections", icon: "⚡" },
  { name: "Wallets", icon: "💳" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const bestSellers = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-base-950 text-white">
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-accent-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-yellow-300">
              Groomers Cave
            </h1>
            <Nav />
          </div>
        </div>
      </header>

      {/* Premium Hero Section with Animation */}
      <section className="relative bg-gradient-to-b from-base-900 via-base-950 to-base-950 overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15),transparent_50%)] opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(212,175,55,0.1),transparent_60%)] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Animated headline */}
            <div className="animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-accent-200 to-accent-400">
                Elevate Your Style
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-accent-500 to-accent-300 mx-auto rounded-full"></div>
            </div>
            
            {/* Animated subtitle */}
            <div className="animate-fade-in-up animate-stagger-1">
              <p className="text-lg sm:text-xl lg:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed">
                Premium men's grooming, luxury fragrances, and exclusive lifestyle essentials curated for the discerning gentleman
              </p>
            </div>
            
            {/* Animated search */}
            <div className="animate-fade-in-up animate-stagger-2 max-w-md mx-auto w-full">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Discover premium products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-base-950 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white/95 hover:bg-white transition-all duration-300"
                />
                <div className="absolute inset-0 bg-accent-500/20 rounded-lg blur-lg group-focus-within:blur-xl transition-all duration-300 -z-10 opacity-0 group-focus-within:opacity-100"></div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="animate-fade-in-up animate-stagger-3 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent-500/30 transition-all duration-300 hover:scale-105">
                Shop Now →
              </Link>
              <Link href="#categories" className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-accent-500/50 text-accent-400 font-bold rounded-lg hover:bg-accent-500/10 hover:border-accent-500 transition-all duration-300">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Section */}
        {!searchTerm && (
          <section className="py-16 sm:py-24" id="categories">
            <div className="animate-fade-in-up mb-12">
              <h2 className="text-3xl sm:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-accent-300">
                Shop by Category
              </h2>
              <p className="text-text-muted text-lg">Curated collections for every gentleman</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {CATEGORIES.map((category, idx) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name}`}
                  className="animate-fade-in-up group relative overflow-hidden rounded-lg border border-base-800 hover:border-accent-500/50 p-4 sm:p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                    <p className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-accent-400 transition-colors duration-300">{category.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-12 sm:py-16 lg:py-24">
          {loading ? (
            <div className="flex justify-center items-center py-16 sm:py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-600/30 border-t-accent-500"></div>
            </div>
          ) : (
            <>
              <div className="mb-8 sm:mb-12 animate-fade-in-up">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-accent-300">
                  {searchTerm ? `Results for "${searchTerm}"` : "Featured Collections"}
                </h3>
                <p className="text-text-muted text-base sm:text-lg">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} {searchTerm ? "found" : "available"}
                </p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 sm:py-24">
                  <div className="text-base-700 mb-4">
                    <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">No products found</h3>
                  <p className="text-text-muted mb-6">Try adjusting your search or browse all categories</p>
                  <Link href="/products" className="inline-block px-6 py-2 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600 transition-colors duration-300">
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {filteredProducts.map((product: any, idx: number) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Best Sellers Section */}
        {!searchTerm && bestSellers.length > 0 && (
          <section className="py-12 sm:py-16 lg:py-24 border-t border-base-800">
            <div className="mb-8 sm:mb-12 animate-fade-in-up">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-accent-300">
                ⭐ Customer Favorites
              </h2>
              <p className="text-text-muted text-base sm:text-lg">Our most loved and trusted products</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {bestSellers.map((product: any, idx: number) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up relative"
                  style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
                >
                  <div className="absolute -top-3 -right-3 bg-accent-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                    ★
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-b from-base-900 to-black border-t border-accent-500/10 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <h4 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-yellow-300">
                Groomers Cave
              </h4>
              <p className="text-text-muted text-sm leading-relaxed">
                Premium men's grooming, luxury fragrances, and exclusive lifestyle products curated for the discerning gentleman.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-base font-bold text-accent-400 mb-4">SHOP</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Home</Link></li>
                <li><Link href="/products" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Products</Link></li>
                <li><Link href="/cart" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Shopping Cart</Link></li>
                <li><Link href="/orders" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">My Orders</Link></li>
              </ul>
            </div>
            
            {/* Account Links */}
            <div>
              <h4 className="text-base font-bold text-accent-400 mb-4">ACCOUNT</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/signin" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Sign In</Link></li>
                <li><Link href="/dashboard/customer" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Dashboard</Link></li>
                <li><Link href="/wishlist" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Wishlist</Link></li>
                <li><Link href="/dashboard/account" className="text-text-muted hover:text-accent-400 transition-colors duration-300 text-sm">Settings</Link></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-base font-bold text-accent-400 mb-4">UPDATES</h4>
              <p className="text-text-muted text-sm mb-4">Get exclusive offers and new product launches</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm bg-base-900 border border-base-800 text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
                <button className="px-3 py-2 bg-accent-500 text-white font-bold text-sm hover:bg-accent-600 transition-colors duration-300">
                  →
                </button>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent-500/20 to-transparent mb-8"></div>
          
          {/* Footer Bottom */}
          <div className="text-center">
            <p className="text-text-muted text-xs sm:text-sm">
              © 2026 Groomers Cave. All rights reserved. | Premium Men's Grooming & Luxury Lifestyle Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
