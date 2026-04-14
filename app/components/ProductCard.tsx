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
    <Link href={`/products/${product.id}`} className="block group">
      <div className="card-interactive h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-56 bg-base-800 rounded-lg overflow-hidden mb-lg flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-smooth">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={224}
              unoptimized
              className="object-cover w-full h-full transition-transform duration-smooth group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted">
              <svg className="w-12 h-12 mb-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-caption">No Image</span>
            </div>
          )}

          {/* Stock Status Badges */}
          <div className="absolute inset-0 pointer-events-none">
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="font-semibold text-text-primary">Out of Stock</span>
              </div>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-md right-md">
                <span className="badge badge-warning">Low Stock</span>
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistToggle();
            }}
            disabled={wishlistLoading}
            className={`absolute top-md left-md pointer-events-auto p-md rounded-lg transition-all duration-smooth shadow-md hover:scale-110 active:scale-95 ${
              isWishlisted
                ? 'bg-error text-white'
                : 'bg-white/90 text-text-secondary hover:text-error'
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
            ) : (
              <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          {/* Category Badge */}
          {product.category && (
            <div className="mb-md">
              <span className="badge badge-accent text-caption uppercase">
                {product.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-h4 font-semibold text-text-primary mb-xs line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-body-sm text-text-secondary mb-lg line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price & Stock Info */}
          <div className="flex-between mb-lg mt-auto">
            <span className="text-h3 font-bold text-accent-500">
              KES {formatKES(product.priceKES ?? product.price ?? 0)}
            </span>
            <span className={`text-caption font-semibold ${
              product.stock > 10 ? 'text-success' :
              product.stock > 0 ? 'text-warning' : 'text-error'
            }`}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0 || isAdding}
            className={`btn btn-lg w-full hover:scale-102 active:scale-95 transition-transform ${
              product.stock === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isAdding ? (
              <div className="flex items-center justify-center gap-md">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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