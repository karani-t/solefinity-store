"use client";

import { useState, useEffect } from "react";
import { formatKES } from "../lib/currency";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../contexts/CartContext";
import { initiateMpesaPayment, checkPaymentStatus } from "../lib/payment";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "mpesa",
    phoneNumber: "",
  });
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.items.length === 0) {
      router.push("/cart");
    }
  }, [state.items.length, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";

    if (formData.paymentMethod === "mpesa") {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required for M-Pesa";
      } else if (!/^254[0-9]{9}$/.test(formData.phoneNumber.replace(/\s+/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid Kenyan phone number (254XXXXXXXXX)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setPaymentStatus("processing");

    try {
      // Create order first
      const orderData = {
        items: state.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: state.total,
        shippingInfo: formData,
        paymentMethod: formData.paymentMethod,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const { order } = await response.json();

      // Handle payment
      if (formData.paymentMethod === "mpesa") {
        const paymentResponse = await initiateMpesaPayment({
          phoneNumber: formData.phoneNumber,
          amount: state.total,
          accountReference: `Order-${order.id}`,
        });

        if (paymentResponse.success) {
          setTransactionId(paymentResponse.transactionId || null);
          setPaymentStatus("completed");

          // Check payment status after a delay
          setTimeout(async () => {
            const statusResponse = await checkPaymentStatus(paymentResponse.transactionId!);
            if (statusResponse.success) {
              dispatch({ type: "CLEAR_CART" });
              router.push("/order-confirmation");
            } else {
              setPaymentStatus("failed");
              alert("Payment verification failed. Please contact support.");
            }
          }, 5000); // Check after 5 seconds
        } else {
          setPaymentStatus("failed");
          alert(paymentResponse.message);
        }
      } else {
        // For card payment, assume success for demo
        setPaymentStatus("completed");
        dispatch({ type: "CLEAR_CART" });
        router.push("/order-confirmation");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setPaymentStatus("failed");
      alert(error instanceof Error ? error.message : "An error occurred while placing your order");
    }
  };

  if (state.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 ml-4">
                    KES {formatKES(((item.product.priceKES ?? item.product.price ?? 0) as number) * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>KES {formatKES(state.total ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping & Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Nairobi"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="00100"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit Card</option>
                </select>
              </div>

              {formData.paymentMethod === "mpesa" && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    M-Pesa Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    placeholder="254XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your phone number in the format: 254XXXXXXXXX
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={paymentStatus === "processing"}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {paymentStatus === "processing" ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay KES ${formatKES(state.total ?? 0)}`
                )}
              </button>

              {paymentStatus === "processing" && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Processing payment... Please check your phone for M-Pesa prompt.
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    This may take a few moments.
                  </p>
                </div>
              )}

              {paymentStatus === "completed" && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Payment initiated successfully! Verifying transaction...
                  </p>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium">
                    Payment failed. Please try again or contact support.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}