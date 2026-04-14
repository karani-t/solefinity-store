"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../components/Toast";
import ProductReviews from "../../components/ProductReviews";
import { Heart, ShoppingCart, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceKES?: number;
  image: string | null;
  stock: number;
  category: string | null;
  lowStockThreshold: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { dispatch } = useCart();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkWishlistStatus();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        addToast("Product not found", "error");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      addToast("Failed to load product", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/user/wishlist");
      if (response.ok) {
        const data = await response.json();
        const wishlist = Array.isArray(data?.wishlist) ? data.wishlist : [];
        const isInWishlist = wishlist.some((item: any) => item?.id === productId);
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: "ADD_ITEM", payload: product });
    addToast(`${product.name} added to cart!`, "success");
    setIsAdding(false);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

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
          addToast("Removed from wishlist", "info");
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
          addToast("Added to wishlist", "success");
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      addToast("Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
            {!imageError ? (
              <Image
                src={product.image || `/api/placeholder/600/600`}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <div className="text-sm">Image not available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
          </div>

          <div className="text-3xl font-bold text-blue-600">
            KES {((product.priceKES ?? product.price ?? 0) as number).toFixed(2)}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${product.stock > product.lowStockThreshold ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {product.stock > product.lowStockThreshold ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
              </span>
              <span className="text-sm text-gray-500">
                ({product.stock} available)
              </span>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{isAdding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`p-3 rounded-lg border-2 transition-colors ${
                isWishlisted
                  ? "border-red-500 text-red-500 hover:bg-red-50"
                  : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-12">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}