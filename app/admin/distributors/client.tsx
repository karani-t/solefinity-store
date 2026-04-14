"use client";

import { useEffect, useState } from "react";

interface DistributorItem {
  id: string;
  businessName: string;
  businessType: string;
  location: string;
  county: string;
  creditLimit: number;
  isApproved: boolean;
  user: { id: string; name: string; email: string; phone: string; isActive: boolean };
}

export default function DistributorManagementClient() {
  const [distributors, setDistributors] = useState<DistributorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", businessName: "", businessType: "", location: "", county: "", creditLimit: "0", paymentTerms: "30" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchDistributors() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/distributors");
      const data = await res.json();
      if (res.ok) {
        setDistributors(data.distributors || []);
      } else {
        setError(data.error || "Failed to load distributors");
      }
    } catch (err) {
      console.error("Fetch distributors error:", err);
      setError("Unable to load distributors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDistributors();
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
      const res = await fetch("/api/admin/distributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          businessName: form.businessName.trim(),
          businessType: form.businessType.trim(),
          location: form.location.trim(),
          county: form.county.trim(),
          creditLimit: Number(form.creditLimit || 0),
          paymentTerms: Number(form.paymentTerms || 30),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed to create distributor (${res.status})`);
        return;
      }
      setSuccess(`Distributor created! Credentials sent to ${normalizedEmail} and phone`);
      setForm({ name: "", email: "", phone: "", businessName: "", businessType: "", location: "", county: "", creditLimit: "0", paymentTerms: "30" });
      fetchDistributors();
    } catch (err) {
      console.error("Distributor creation error:", err);
      setError(`Failed to create distributor: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (distributorId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this distributor?")) return;
    try {
      const res = await fetch(`/api/admin/distributors?distributorId=${encodeURIComponent(distributorId)}`, { method: "DELETE" });
      if (res.ok) {
        fetchDistributors();
        setSuccess("Distributor deactivated");
      }
    } catch {
      setError("Failed to deactivate distributor");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Distributor Management</h1>

        <div className="bg-black/40 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl mb-6 backdrop-blur-sm">
          <h2 className="font-semibold text-teal-300 mb-4">Add New Distributor</h2>
          {error && <p className="text-rose-300 mb-3 p-3 bg-rose-950/40 rounded">{error}</p>}
          {success && <p className="text-emerald-300 mb-3 p-3 bg-emerald-950/40 rounded">{success}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={handleInput} name="name" placeholder="Contact Name" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.email} onChange={handleInput} name="email" type="email" placeholder="Email" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.phone} onChange={handleInput} name="phone" placeholder="Phone (254...)" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.businessName} onChange={handleInput} name="businessName" placeholder="Business Name" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.businessType} onChange={handleInput} name="businessType" placeholder="Business Type (Retail/Wholesale)" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.location} onChange={handleInput} name="location" placeholder="Location" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.county} onChange={handleInput} name="county" placeholder="County" required disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <input value={form.creditLimit} onChange={handleInput} name="creditLimit" type="number" placeholder="Credit Limit (KES)" disabled={submitting} className="w-full border border-slate-600 bg-slate-900 text-white rounded px-3 py-2" />
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 font-semibold w-full">
                {submitting ? "Creating..." : "Create Distributor (Auto-generate Credentials)"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-black/40 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl mb-6 backdrop-blur-sm">
          <h2 className="font-semibold text-teal-300 mb-4">Current Distributors</h2>
          {loading ? (
            <p>Loading distributors...</p>
          ) : distributors.length === 0 ? (
            <p>No distributors found.</p>
          ) : (
            <div className="space-y-4">
              {distributors.map((item) => (
                <div key={item.id} className="p-4 border border-slate-700 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-black/20">
                  <div>
                    <p className="font-semibold text-white">{item.user.name} ({item.user.email})</p>
                    <p className="text-sm text-slate-300">Business: {item.businessName} | Type: {item.businessType} | County: {item.county}</p>
                    <p className="text-sm text-slate-300">Credit Limit: KES {item.creditLimit} | Approved: {item.isApproved ? "Yes" : "No"}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-300 font-semibold">Deactivate</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
