"use client";

import { useCart } from "../contexts/CartContext";
import { formatKES } from "../lib/currency";
import Link from "next/link";

export default function Cart() {
  const { state, dispatch } = useCart();

  const handleRemoveItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {state.items.map((item) => (
              <div key={item.product.id} className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600">KES {formatKES(item.product.priceKES ?? item.product.price ?? 0)}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-t border-b border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">
                      KES {formatKES(((item.product.priceKES ?? item.product.price ?? 0) as number) * item.quantity)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-gray-900">
              KES {formatKES(state.total ?? 0)}
            </span>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}