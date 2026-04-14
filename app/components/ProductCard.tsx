"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useToast } from "./Toast";
import { formatKES } from "../lib/currency";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistInitialized, setWishlistInitialized] = useState(false);

  useEffect(() => {
    const loadWishlistState = async () => {
      try {
        const response = await fetch("/api/user/wishlist");
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.products)) {
          const found = data.products.some((item: any) => item.id === product.id);
          setIsWishlisted(found);
        }
      } catch (err) {
        console.error("Error loading wishlist state", err);
      } finally {
        setWishlistInitialized(true);
      }
    };

    loadWishlistState();
  }, [product.id]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: "ADD_ITEM", payload: product });
    addToast(`${product.name} added to cart!`, "success");
    setIsAdding(false);
  };

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const response = await fetch("/api/user/wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product.id }),
        });
        if (response.ok) {
          setIsWishlisted(false);
          addToast(`${product.name} removed from wishlist`, "info");
        } else {
          addToast("Failed to remove from wishlist", "error");
        }
      } else {
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product.id }),
        });
        if (response.ok) {
          setIsWishlisted(true);
          addToast(`${product.name} added to wishlist!`, "success");
        } else {
          const message = (await response.json()).error || "Failed to add to wishlist";
          addToast(message, "error");
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="bg-slate-900/70 rounded-xl shadow-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(131,71,255,0.35)] transition-all duration-300 transform hover:-translate-y-1 border border-slate-700">
        <div className="relative h-48 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center overflow-hidden">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              unoptimized
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistToggle();
            }}
            disabled={wishlistLoading}
            className={`absolute top-2 left-2 p-2 rounded-full transition-all duration-200 ${
              isWishlisted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
            } shadow-md`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>

          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Low Stock
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="mb-2">
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {product.category}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-gray-900">
              KES {formatKES(product.priceKES ?? product.price ?? 0)}
            </span>
            <span className={`text-sm font-medium ${
              product.stock > 10 ? 'text-green-600' :
              product.stock > 0 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0 || isAdding}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAdding
                ? 'bg-blue-500 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
            }`}
          >
            {isAdding ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : product.stock === 0 ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}