"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StaffItem {
  id: string;
  staffId: string;
  department: string;
  warehouseId?: string | null;
  isApproved: boolean;
  user: { id: string; name: string; email: string; phone?: string; isActive: boolean; role: string };
}

export default function StaffManagementClient() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", department: "", warehouseId: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchStaff() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      } else {
        setError(data.error || "Failed to load staff");
      }
    } catch (err) {
      console.error("Fetch staff error:", err);
      setError("Unable to load staff");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const normalizedEmail = form.email.trim().toLowerCase();
    const normalizedPhone = form.phone.trim();

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          department: form.department.trim(),
          warehouseId: form.warehouseId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed to create staff (${res.status})`);
        return;
      }
      setSuccess(`Staff created successfully! Credentials sent to ${normalizedEmail} and phone`);
      setForm({ name: "", email: "", phone: "", department: "", warehouseId: "" });
      fetchStaff();
    } catch (err) {
      console.error("Staff creation error:", err);
      setError(`Failed to create staff: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      const res = await fetch(`/api/admin/staff?staffId=${encodeURIComponent(staffId)}`, { method: "DELETE" });
      if (res.ok) {
        fetchStaff();
        setSuccess("Staff member deactivated");
      }
    } catch {
      setError("Failed to deactivate staff");
    }
  };

  const handlePromote = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });
      if (res.ok) {
        fetchStaff();
        setSuccess(`Role updated to ${newRole}`);
      }
    } catch {
      setError("Failed to update role");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Staff Management</h1>

        <div className="bg-black/40 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl mb-6 backdrop-blur-sm">
          <h2 className="font-semibold mb-4">Add New Staff</h2>
          {error && <p className="text-red-600 mb-3 p-3 bg-red-50 rounded">{error}</p>}
          {success && <p className="text-green-600 mb-3 p-3 bg-green-50 rounded">{success}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={handleInput} name="name" placeholder="Full Name" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.email} onChange={handleInput} name="email" type="email" placeholder="Email" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.phone} onChange={handleInput} name="phone" placeholder="Phone (254...)" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.department} onChange={handleInput} name="department" placeholder="Department (e.g., Sales, Inventory)" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.warehouseId} onChange={handleInput} name="warehouseId" placeholder="Warehouse ID (optional)" disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 font-semibold w-full">
                {submitting ? "Creating..." : "Create Staff (Auto-generate Credentials)"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-black/40 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl mb-6 backdrop-blur-sm">
          <h2 className="font-semibold text-emerald-300 mb-4">Current Staff</h2>

          {loading ? (
            <p>Loading staff...</p>
          ) : staff.length === 0 ? (
            <p>No staff found.</p>
          ) : (
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.staffId} className="p-4 border border-slate-700 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-black/25">
                  <div>
                    <p className="font-semibold text-white">{member.user.name} ({member.user.email})</p>
                    <p className="text-sm text-slate-300">Department: {member.department} | Warehouse: {member.warehouseId || "None"}</p>
                    <p className="text-sm text-slate-300">Status: {member.isApproved ? "Approved" : "Pending"}</p>
                  </div>
                  <div className="flex gap-2 items-center mt-3 md:mt-0">
                    <select
                      value={member.user.role}
                      onChange={(e) => handlePromote(member.user.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-sm"
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                    <button onClick={() => handleDelete(member.staffId)} className="text-red-400 hover:text-red-300 text-sm font-semibold">Deactivate</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
