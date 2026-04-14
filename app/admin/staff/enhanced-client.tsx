"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Clock, UserCheck, UserX, Send } from "lucide-react";

interface StaffMember {
  id: string;
  staffId: string;
  department: string;
  warehouseId?: string | null;
  isApproved: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    lastLogin?: string;
    role: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string };
  receiver: { id: string; name: string };
}

export default function EnhancedStaffManagementClient() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageForm, setMessageForm] = useState({ subject: "", content: "" });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filterActive, setFilterActive] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Fetch staff error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(staffId: string) {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }

  async function sendMessage(staffId: string) {
    if (!messageForm.subject || !messageForm.content) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageForm),
      });

      if (res.ok) {
        setMessageForm({ subject: "", content: "" });
        fetchMessages(staffId);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSendingMessage(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    if (filterActive === "ACTIVE") return member.user.isActive;
    if (filterActive === "INACTIVE") return !member.user.isActive;
    return true;
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Staff List */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Staff Directory</h2>

            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterActive(filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    filterActive === filter
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Staff List */}
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredStaff.map((member) => (
              <button
                key={member.staffId}
                onClick={() => {
                  setSelectedStaff(member);
                  fetchMessages(member.user.id);
                }}
                className={`w-full p-3 rounded-lg text-left transition-all border ${
                  selectedStaff?.staffId === member.staffId
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                    : "bg-white text-gray-900 border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold">{member.user.name}</div>
                <div className={`text-xs ${selectedStaff?.staffId === member.staffId ? "text-blue-100" : "text-gray-500"}`}>
                  {member.department}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {member.user.isActive ? (
                    <UserCheck className="w-3 h-3 text-green-600" />
                  ) : (
                    <UserX className="w-3 h-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      member.user.isActive
                        ? selectedStaff?.staffId === member.staffId
                          ? "text-blue-100"
                          : "text-green-600"
                        : selectedStaff?.staffId === member.staffId
                        ? "text-red-100"
                        : "text-red-600"
                    }`}
                  >
                    {member.user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages & Details */}
      <div className="lg:col-span-2">
        {selectedStaff ? (
          <div className="space-y-6">
            {/* Staff Details */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedStaff.user.name}</h3>
                  <p className="text-gray-600">{selectedStaff.user.email}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedStaff.user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedStaff.user.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="font-semibold text-gray-900">{selectedStaff.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{selectedStaff.isApproved ? "Approved" : "Pending"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last Login
                  </p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedStaff.user.lastLogin)}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Messages</h3>

              {/* Message Thread */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-64 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-10">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-lg ${msg.senderId === selectedStaff.user.id ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"}`}>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{msg.sender.name}</p>
                        <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="font-medium text-sm text-gray-600">{msg.subject}</p>
                      <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Form */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Your message..."
                  value={messageForm.content}
                  onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => sendMessage(selectedStaff.user.id)}
                  disabled={sendingMessage || !messageForm.subject || !messageForm.content}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a staff member to view details and messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
