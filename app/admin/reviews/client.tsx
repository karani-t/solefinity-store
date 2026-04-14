"use client";

import { useState, useEffect } from "react";
import { Star, TrendingUp, Users, MessageSquare, CheckCircle, Clock, XCircle, Filter, X, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    priceKES: number;
  };
}

interface Statistics {
  totalReviews: number;
  averageRating: number;
  recentReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  statusDistribution: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  reviews: Review[];
  statistics: Statistics;
  pagination: Pagination;
}

export default function ReviewsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    productId: "",
    rating: "",
    dateFrom: "",
    dateTo: "",
  });
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage, filters]);

  const handleModerateReview = async (reviewId: string, action: string, response?: string) => {
    try {
      const res = await fetch("/api/admin/reviews/moderate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, action, response }),
      });

      if (!res.ok) {
        throw new Error("Failed to moderate review");
      }

      const result = await res.json();
      // Refresh the reviews list
      fetchReviews(currentPage);
      setRespondingTo(null);
      setResponseText("");
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to moderate review");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      productId: "",
      rating: "",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchReviews(currentPage)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
        <p className="text-gray-600">Manage and monitor customer feedback</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.statistics.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-900">{data.statistics.statusDistribution.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{data.statistics.statusDistribution.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{data.statistics.statusDistribution.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {Object.values(filters).some(v => v) && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Distribution</h2>
        <div className="space-y-3">
          {data.statistics.ratingDistribution.map((dist) => (
            <div key={dist.rating} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm font-medium text-gray-600 mr-2">{dist.rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm text-gray-600">{dist.count}</span>
              </div>
              <div className="w-16 text-right ml-4">
                <span className="text-sm text-gray-600">({dist.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No reviews found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        by {review.user.name}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        on {formatDate(review.createdAt)}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        review.isApproved
                          ? 'bg-green-100 text-green-800'
                          : review.adminResponse
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.isApproved ? 'Approved' : review.adminResponse ? 'Rejected' : 'Pending'}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Product: {review.product.name}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        (KES {review.product.priceKES})
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    {review.adminResponse && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                        <div className="flex items-center mb-1">
                          <MessageCircle className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-900">Admin Response</span>
                          {review.respondedAt && (
                            <span className="ml-2 text-xs text-blue-600">
                              {formatDate(review.respondedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-800">{review.adminResponse}</p>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <span>User: {review.user.email}</span>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {!review.isApproved && !review.adminResponse && (
                      <>
                        <button
                          onClick={() => handleModerateReview(review.id, "approve")}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRespondingTo(review.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Respond
                        </button>
                      </>
                    )}
                    {review.isApproved && (
                      <button
                        onClick={() => handleModerateReview(review.id, "reject")}
                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Response Form */}
                {respondingTo === review.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Respond to Review</h4>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response to this review..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModerateReview(review.id, "respond", responseText)}
                        disabled={!responseText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Response
                      </button>
                      <button
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText("");
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * data.pagination.limit) + 1} to{" "}
              {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of{" "}
              {data.pagination.total} reviews
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                disabled={currentPage === data.pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}