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
    <Link href={`/products/${product.id}`} className="block group h-full">
      <div className="h-full flex flex-col bg-base-100 border border-base-300 transition-all duration-150 group-hover:border-accent-500/50 group-hover:shadow-md group-hover:scale-102 overflow-hidden rounded-lg">
        {/* Compact Image Container - Optimized for Grid */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-base-900 to-base-800 overflow-hidden flex items-center justify-center group-hover:from-base-800 group-hover:to-base-700 transition-colors duration-150">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              width={320}
              height={180}
              unoptimized
              className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted px-md">
              <svg className="w-10 h-10 mb-xs opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-caption text-text-muted text-center">Image</span>
            </div>
          )}

          {/* Stock Status - Minimal Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <span className="font-bold text-text-primary text-sm tracking-wide">OUT OF STOCK</span>
              </div>
            )}
          </div>

          {/* Wishlist Button - Compact */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistToggle();
            }}
            disabled={wishlistLoading}
            className={`absolute top-md right-md pointer-events-auto p-1.5 rounded-full transition-all duration-150 hover:scale-110 active:scale-95 text-sm ${
              isWishlisted
                ? 'bg-accent-500 text-text-primary shadow-md'
                : 'bg-white/90 text-text-secondary hover:bg-white shadow-sm hover:shadow-md'
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>

          {/* Low Stock Badge - Top Left */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-md left-md">
              <span className="badge badge-warning font-bold text-white text-xs px-2 py-0.5">Only {product.stock}</span>
            </div>
          )}
        </div>

        {/* Content Area - Compact Efficient Layout */}
        <div className="flex flex-col flex-1 p-md space-y-sm">
          {/* Category Badge */}
          {product.category && (
            <div>
              <span className="inline-block badge badge-accent text-xs uppercase font-bold letter-spacing-05 px-sm py-xs">
                {product.category}
              </span>
            </div>
          )}

          {/* Title - Compact and Bold */}
          <h3 className="text-base font-bold text-text-primary line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Description - Subtle Truncated */}
          {product.description && (
            <p className="text-xs text-text-muted line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Spacer - Efficient Flex Grow */}
          <div className="flex-1" />

          {/* Price - Gold Emphasis Compact */}
          <div className="flex items-baseline gap-xs pt-sm border-t border-base-700">
            <span className="text-lg font-bold text-accent-500">
              KES {formatKES(product.priceKES ?? product.price ?? 0)}
            </span>
            <span className="text-xs text-text-muted">
              unit
            </span>
          </div>

          {/* Add to Cart Button - Compact CTA */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0 || isAdding}
            className={`btn w-full text-sm font-semibold transition-all duration-200 h-9 ${
              product.stock === 0
                ? 'btn-ghost opacity-50 cursor-not-allowed'
                : 'btn-primary hover:shadow-lg active:scale-95'
            }`}
          >
            {isAdding ? (
              <div className="flex items-center justify-center gap-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                <span>Adding...</span>
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