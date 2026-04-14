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
import { DashboardHeader, StatCard } from "@/app/components/DashboardHeader";

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

  const [restockForm, setRestockForm] = useState({
    productId: "",
    quantityAdded: "",
    restockNotes: "",
  });
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockSuccess, setRestockSuccess] = useState(false);

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageForm, setMessageForm] = useState({
    receiverId: "",
    subject: "",
    content: "",
  });
  const [messageLoading, setMessageLoading] = useState(false);

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
      <div className="flex min-h-screen bg-gradient-to-b from-base-950 via-base-900 to-base-950">
        <Sidebar />
        <div className="flex-1 flex-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-400 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-base-950 via-base-900 to-base-950 text-text-primary">
      <Sidebar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-lg sm:px-xxxl lg:px-max py-xxxl">
          <div className="flex-between mb-xxxl">
            <div>
              <h1 className="text-h1 font-bold">Distributor Dashboard</h1>
              <p className="text-text-secondary text-body mt-md">Manage inventory, messages, and track activities</p>
            </div>
            <Link href="/dashboard/distributor/reports" className="btn btn-secondary flex-center gap-md">
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </Link>
          </div>

          {error && (
            <div className="mb-lg p-lg bg-error/10 border border-error/30 rounded-lg text-error">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-md mb-xxxl overflow-x-auto border-b border-base-700/50 pb-md">
            {(["alerts", "restock", "messages", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-center gap-sm px-lg py-md whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-accent-500 text-accent-400"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab === "alerts" && <AlertTriangle className="w-5 h-5" />}
                {tab === "restock" && <Package className="w-5 h-5" />}
                {tab === "messages" && <MessageSquare className="w-5 h-5" />}
                {tab === "activity" && <BarChart3 className="w-5 h-5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "alerts" && dashboardData && dashboardData.totalNotifications > 0 && (
                  <span className="badge badge-error text-xs">{dashboardData.totalNotifications}</span>
                )}
              </button>
            ))}
          </div>

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-lg">
              {/* Notifications */}
              <div className="card-lg">
                <div className="px-lg py-md border-b border-base-700/30 flex-center gap-md">
                  <Bell className="w-5 h-5 text-warning-400" />
                  <h2 className="text-lg font-semibold">Active Notifications</h2>
                </div>
                <div className="divide-y divide-base-700/30">
                  {dashboardData?.notifications.length === 0 ? (
                    <div className="p-lg text-center text-text-muted">No active alerts</div>
                  ) : (
                    dashboardData?.notifications.map((n) => (
                      <div key={n.id} className="p-lg hover:bg-base-800/30 transition-colors">
                        <div className="flex-between">
                          <div>
                            <h3 className="font-semibold">{n.product.name}</h3>
                            <p className="text-sm text-text-secondary mt-sm">
                              Stock: <span className="text-error font-bold">{n.currentStock}</span> / Threshold: {n.threshold}
                            </p>
                            <p className="text-xs text-text-muted mt-xs">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="badge badge-error">CRITICAL</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="card-lg">
                <div className="px-lg py-md border-b border-base-700/30 flex-center gap-md">
                  <Package className="w-5 h-5 text-accent-400" />
                  <h2 className="text-lg font-semibold">Products Below Threshold</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md p-lg">
                  {dashboardData?.lowStockProducts.map((p) => (
                    <div key={p.id} className="card p-md">
                      <h3 className="font-semibold mb-md">{p.name}</h3>
                      <div className="space-y-sm text-sm">
                        <div className="flex-between">
                          <span className="text-text-secondary">Stock:</span>
                          <span className="font-bold text-error">{p.stock}</span>
                        </div>
                        <div className="flex-between">
                          <span className="text-text-secondary">Threshold:</span>
                          <span>{p.lowStockThreshold}</span>
                        </div>
                        <div className="flex-between">
                          <span className="text-text-secondary">Reorder:</span>
                          <span>{p.reorderQuantity}</span>
                        </div>
                      </div>
                      <div className="w-full bg-base-700 rounded-full h-2 mt-md overflow-hidden">
                        <div
                          className="bg-error h-full transition-all"
                          style={{ width: `${Math.min((p.stock / p.lowStockThreshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Restock Tab */}
          {activeTab === "restock" && (
            <div className="card-lg max-w-2xl">
              <div className="px-lg py-md border-b border-base-700/30">
                <h2 className="text-lg font-semibold">Record Restock</h2>
              </div>

              {restockSuccess && (
                <div className="mx-lg mt-lg p-lg bg-success/10 border border-success/30 rounded-lg flex-center gap-md text-success">
                  <CheckCircle className="w-5 h-5" />
                  Restock recorded successfully!
                </div>
              )}

              <form onSubmit={handleRestock} className="p-lg space-y-lg">
                <div>
                  <label className="label">Select Product</label>
                  <select
                    value={restockForm.productId}
                    onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                    required
                    className="input w-full"
                  >
                    <option value="">Choose a product...</option>
                    {dashboardData?.lowStockProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Quantity Added</label>
                  <input
                    type="number"
                    value={restockForm.quantityAdded}
                    onChange={(e) => setRestockForm({ ...restockForm, quantityAdded: e.target.value })}
                    required
                    min="1"
                    className="input w-full"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    value={restockForm.restockNotes}
                    onChange={(e) => setRestockForm({ ...restockForm, restockNotes: e.target.value })}
                    rows={3}
                    className="input w-full"
                    placeholder="e.g., New shipment, supplier info..."
                  />
                </div>

                <button type="submit" disabled={restockLoading} className="btn btn-primary w-full">
                  {restockLoading ? "Recording..." : "Record Restock"}
                </button>
              </form>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="card-lg">
              <div className="px-lg py-md border-b border-base-700/30 flex-between items-center">
                <h2 className="text-lg font-semibold">Messages with Admin</h2>
                <button
                  onClick={() => setShowMessageForm(!showMessageForm)}
                  className="btn btn-sm btn-primary flex-center gap-sm"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>

              {showMessageForm && (
                <form onSubmit={handleSendMessage} className="p-lg border-b border-base-700/30 bg-base-800/50 space-y-md">
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    required
                    className="input w-full"
                    placeholder="Subject"
                  />
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    required
                    rows={3}
                    className="input w-full"
                    placeholder="Your message..."
                  />
                  <div className="flex gap-md">
                    <button type="submit" disabled={messageLoading} className="btn btn-primary flex-1">
                      {messageLoading ? "Sending..." : "Send"}
                    </button>
                    <button type="button" onClick={() => setShowMessageForm(false)} className="btn btn-ghost">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-base-700/30 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-lg text-center text-text-muted">No messages</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="p-lg hover:bg-base-800/30 transition-colors">
                      <div className="flex-between items-start gap-md">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{m.subject}</h3>
                          <p className="text-sm text-text-secondary mt-xs truncate">{m.content}</p>
                          <p className="text-xs text-text-muted mt-sm">
                            {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`badge ${m.direction === "sent" ? "badge-accent" : "badge-success"} text-xs`}>
                          {m.direction === "sent" ? "Sent" : "Received"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="card-lg">
              <div className="px-lg py-md border-b border-base-700/30 flex-between">
                <h2 className="text-lg font-semibold">Activity Log</h2>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="input text-sm px-md py-sm"
                >
                  <option value="ALL">All Activities</option>
                  <option value="RESTOCK">Restock</option>
                  <option value="ORDER_PLACED">Orders</option>
                  <option value="MESSAGE_SENT">Messages</option>
                </select>
              </div>

              <div className="divide-y divide-base-700/30 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="p-lg text-center text-text-muted">No activities</div>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="p-lg hover:bg-base-800/30 transition-colors">
                      <div className="flex items-start gap-md">
                        <span className="badge badge-secondary text-xs">{a.activityType}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{a.description}</p>
                          <p className="text-xs text-text-muted mt-xs">
                            {new Date(a.createdAt).toLocaleString()}
                          </p>
                        </div>
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
