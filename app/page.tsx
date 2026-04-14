"use client";

import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import Nav from "./components/Nav";
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-black/40 backdrop-blur-sm border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-amber-300">
              Groomers Cave
            </h1>
            <Nav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.2),_rgba(15,23,42,0.75)_80%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gold-200 to-amber-200">
              Elevate Your Style
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Premium men's grooming, luxury fragrances, and exclusive lifestyle essentials
            </p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white/90"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                {searchTerm ? `Search Results for "${searchTerm}"` : "Featured Drops"}
              </h3>
              <p className="text-slate-300">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-black border-t border-gold-500/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-amber-300 mb-4">
                Groomers Cave
              </h4>
              <p className="text-slate-400">
                Premium men's grooming, luxury fragrances, and exclusive lifestyle products for the discerning gentleman.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-slate-400 hover:text-gold-300 transition-colors">Home</a></li>
                <li><a href="/products" className="text-slate-400 hover:text-gold-300 transition-colors">Products</a></li>
                <li><a href="/cart" className="text-slate-400 hover:text-gold-300 transition-colors">Cart</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/orders" className="text-slate-400 hover:text-gold-300 transition-colors">My Orders</a></li>
                <li><a href="/dashboard/customer" className="text-slate-400 hover:text-gold-300 transition-colors">Dashboard</a></li>
                <li><a href="/wishlist" className="text-slate-400 hover:text-gold-300 transition-colors">Wishlist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Connect</h4>
              <p className="text-slate-400">
                Experience premium grooming excellence and exclusive lifestyle products.
              </p>
            </div>
          </div>
          <div className="border-t border-base-800 mt-8 pt-8 text-center">
            <p className="text-slate-500">© 2026 Groomers Cave. All rights reserved. | Premium Men's Grooming & Luxury Lifestyle</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
