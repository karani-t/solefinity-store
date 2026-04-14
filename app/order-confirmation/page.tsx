import Link from "next/link";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="flex space-x-4">
            <Link
              href="/"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}