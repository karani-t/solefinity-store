"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

export default function AccountManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        });
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        body: formDataToSend,
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
      }
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (res.ok) {
        setMessage("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswords({ current: "", new: "", confirm: "" });
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={session?.user.role === "ADMIN" ? "/admin" : `/dashboard/${session?.user.role.toLowerCase()}`} className="text-purple-300 hover:text-purple-200 mb-4 inline-flex items-center gap-2">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Account Management</h1>
          <p className="text-gray-300">Manage your profile, security, and preferences</p>
        </div>

        {message && <div className="mb-6 p-4 bg-green-900/30 border border-green-500 text-green-200 rounded-lg">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-500 text-red-200 rounded-lg">{error}</div>}

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-700/40 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center overflow-hidden border-4 border-purple-500">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.name}</h2>
                <p className="text-gray-300">{profile?.email}</p>
                <p className="text-purple-300 text-sm mt-1">Role: <span className="font-semibold">{session?.user.role}</span></p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing && (
            <form onSubmit={handleSaveProfile} className="mt-8 pt-8 border-t border-purple-700/40">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-700/40 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">Security</h3>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
          >
            Change Password
          </button>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-purple-700 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-purple-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswords({ current: "", new: "", confirm: "" });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
