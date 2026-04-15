"use client";

import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Nav from "../components/Nav";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceKES?: number;
  image: string | null;
  stock: number;
  category: string | null;
}

export default function Products() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique categories
  const categories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  ).sort();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on selected category
    if (selectedCategory) {
      setFilteredProducts(allProducts.filter((p) => p.category === selectedCategory));
    } else {
      setFilteredProducts(allProducts);
    }
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [selectedCategory, allProducts]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-charcoal-900 to-black border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-amber-300">
              Groomers Cave
            </h1>
            <Nav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-5xl font-black mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-200">
              Premium Collection
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Discover our curated selection of premium men's grooming products, luxury fragrances, and lifestyle essentials.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold-500/30 border-t-gold-400"></div>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-3">
                {/* All Products Button */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    selectedCategory === null
                      ? "bg-gradient-to-r from-gold-400 to-amber-300 text-black shadow-lg shadow-gold-400/30"
                      : "bg-base-800 text-gray-300 border border-base-700 hover:border-gold-400/50 hover:text-gold-300"
                  }`}
                >
                  All Products ({allProducts.length})
                </button>

                {/* Category Buttons */}
                {categories.map((category) => {
                  const categoryCount = allProducts.filter((p) => p.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-gold-400 to-amber-300 text-black shadow-lg shadow-gold-400/30"
                          : "bg-base-800 text-gray-300 border border-base-700 hover:border-gold-400/50 hover:text-gold-300"
                      }`}
                    >
                      {category} ({categoryCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-6 flex justify-between items-center px-2">
              <p className="text-gray-400">
                Showing <span className="text-gold-400 font-semibold">{startIndex + 1}</span> to{" "}
                <span className="text-gold-400 font-semibold">{Math.min(endIndex, filteredProducts.length)}</span> of{" "}
                <span className="text-gold-400 font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-base-900/50 rounded-2xl border border-base-800">
                <div className="text-gold-400/50 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or browse another category.
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-block bg-gradient-to-r from-gold-400 to-amber-300 text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold-400/30 transition-all"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <>
                {/* Product Grid - Responsive Compact Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-12">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-base-800 text-gray-300 border border-base-700 hover:border-gold-400/50 hover:text-gold-300"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-gold-400 to-amber-300 text-black"
                              : "bg-base-800 text-gray-300 border border-base-700 hover:border-gold-400/50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-base-800 text-gray-300 border border-base-700 hover:border-gold-400/50 hover:text-gold-300"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black via-base-950 to-gray-900 border-t border-gold-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-amber-300 mb-4">
                Groomers Cave
              </h4>
              <p className="text-gray-400">
                Premium men's grooming, luxury fragrances, and exclusive lifestyle products.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-gold-300 transition-colors">Home</a></li>
                <li><a href="/products" className="text-gray-400 hover:text-gold-300 transition-colors">Products</a></li>
                <li><a href="/cart" className="text-gray-400 hover:text-gold-300 transition-colors">Cart</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Account</h4>
              <ul className="space-y-2">
                <li><a href="/dashboard/customer" className="text-gray-400 hover:text-gold-300 transition-colors">Dashboard</a></li>
                <li><a href="/orders" className="text-gray-400 hover:text-gold-300 transition-colors">My Orders</a></li>
                <li><a href="/wishlist" className="text-gray-400 hover:text-gold-300 transition-colors">Wishlist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gold-300 mb-4">Support</h4>
              <p className="text-gray-400 mb-3">
                Have questions? We're here to help.
              </p>
              <a href="mailto:support@groomerscave.com" className="text-gold-300 hover:text-gold-100 transition-colors">contact@groomerscave.com</a>
            </div>
          </div>
          <div className="border-t border-base-800 pt-8">
            <p className="text-center text-gray-500">© 2026 Groomers Cave. All rights reserved. | Premium Men's Grooming & Lifestyle</p>
          </div>
        </div>
      </footer>
    </div>
  );
}