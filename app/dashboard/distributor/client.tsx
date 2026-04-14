"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Package,
  MessageSquare,
  BarChart3,
  Bell,
  Send,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";
import { Sidebar } from "@/app/components/Sidebar";

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  reorderQuantity: number;
  priceKES: number;
  category: string;
  image?: string;
}

interface Notification {
  id: string;
  productId: string;
  currentStock: number;
  threshold: number;
  isRead: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  };
}

interface Message {
  id: string;
  subject: string;
  content: string;
  direction: "sent" | "received";
  read: boolean;
  createdAt: string;
  sender?: { name: string; email: string; role: string };
  receiver?: { name: string; email: string; role: string };
}

interface Activity {
  id: string;
  activityType: string;
  description: string;
  metadata: any;
  createdAt: string;
}

interface DashboardData {
  lowStockProducts: LowStockProduct[];
  notifications: Notification[];
  totalNotifications: number;
}

export default function DistributorDashboard() {
  const [activeTab, setActiveTab] = useState<"alerts" | "restock" | "messages" | "activity">("alerts");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restock form state
  const [restockForm, setRestockForm] = useState({
    productId: "",
    quantityAdded: "",
    restockNotes: "",
  });
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockSuccess, setRestockSuccess] = useState(false);

  // Messaging state
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({
    receiverId: "",
    subject: "",
    content: "",
  });
  const [messageLoading, setMessageLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  // Activity filter state
  const [activityFilter, setActivityFilter] = useState("ALL");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/distributor/low-stock");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/distributor/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (activityFilter !== "ALL") {
        params.append("type", activityFilter);
      }

      const response = await fetch(`/api/distributor/activity?${params}`);
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      setActivities(data.activities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRestockLoading(true);
      const response = await fetch("/api/distributor/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: restockForm.productId,
          quantityAdded: parseInt(restockForm.quantityAdded),
          restockNotes: restockForm.restockNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to record restock");

      setRestockSuccess(true);
      setRestockForm({ productId: "", quantityAdded: "", restockNotes: "" });
      await fetchDashboardData();

      setTimeout(() => setRestockSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record restock");
    } finally {
      setRestockLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessageLoading(true);
      const response = await fetch("/api/distributor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageForm),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setMessageForm({ receiverId: "", subject: "", content: "" });
      setShowMessageForm(false);
      await fetchMessages();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab, activityFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your inventory, messages, and track your activities</p>
          </div>
          <Link href="/dashboard/distributor/reports" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all">
            <BarChart3 className="w-5 h-5" />
            <span>Reports</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "alerts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alerts
            {dashboardData && dashboardData.totalNotifications > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {dashboardData?.totalNotifications}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("restock")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "restock"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Package className="w-5 h-5" />
            Restock Inventory
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "messages"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
              activeTab === "activity"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Activity Log
          </button>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Low Stock Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Active Notifications
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData?.notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No active low stock alerts
                  </div>
                ) : (
                  dashboardData?.notifications.map(notification => (
                    <div key={notification.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {notification.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Current Stock: <span className="font-bold text-red-600">{notification.currentStock}</span> / Threshold: {notification.threshold}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          CRITICAL
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Products Below Threshold
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {dashboardData?.lowStockProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-bold text-red-600">{product.stock}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Threshold:</span>
                        <span>{product.lowStockThreshold}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reorder Qty:</span>
                        <span>{product.reorderQuantity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(product.stock / product.lowStockThreshold) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restock Inventory Tab */}
        {activeTab === "restock" && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Restock Activity</h2>

            {restockSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Restock recorded successfully!
              </div>
            )}

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Select Product
                </label>
                <select
                  value={restockForm.productId}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, productId: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a product...</option>
                  {dashboardData?.lowStockProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Quantity Added
                </label>
                <input
                  type="number"
                  value={restockForm.quantityAdded}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, quantityAdded: e.target.value })
                  }
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={restockForm.restockNotes}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, restockNotes: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., New shipment received, supplier info, etc."
                />
              </div>

              <button
                type="submit"
                disabled={restockLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restockLoading ? "Recording..." : "Record Restock"}
              </button>
            </form>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Messages with Admin</h2>
              <button
                onClick={() => setShowMessageForm(!showMessageForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                New Message
              </button>
            </div>

            {showMessageForm && (
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={messageForm.subject}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, subject: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Message subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Message
                    </label>
                    <textarea
                      value={messageForm.content}
                      onChange={(e) =>
                        setMessageForm({ ...messageForm, content: e.target.value })
                      }
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your message..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={messageLoading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMessageForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No messages yet
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            message.direction === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {message.direction === "sent" ? "Sent" : "Received"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Activity Track Record</h2>
                <select
                  value={activityFilter}
                  onChange={(e) => {
                    setActivityFilter(e.target.value);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Activities</option>
                  <option value="RESTOCK">Restock</option>
                  <option value="ORDER_PLACED">Orders</option>
                  <option value="MESSAGE_SENT">Messages</option>
                  <option value="PRICE_VIEW">Price Views</option>
                  <option value="PROFILE_UPDATE">Profile Updates</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No activities found
                </div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium mb-2">
                          {activity.activityType}
                        </span>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        {activity.metadata && (
                          <div className="text-xs text-gray-600 mt-2">
                            <details className="cursor-pointer">
                              <summary className="font-medium">Details</summary>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(activity.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(activity.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
