"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ProfilePictureUpload,
  AccountInfoForm,
  PasswordChangeForm,
  ActivitySummary,
} from "@/app/components/AccountSettingsForm";
import { useToast } from "@/app/components/Toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  lastLogin?: string;
  createdAt?: string;
  role?: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        addToast("Failed to load profile", "error");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      addToast("Error loading profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await fetch("/api/user/profile-picture", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.details || data.error || "Upload failed");
    }

    const data = await res.json();
    addToast("Profile picture updated successfully", "success");
  };

  const handleAccountInfoUpdate = async (data: any) => {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Update failed");
    }

    const result = await res.json();
    setProfile(result.user);
    addToast("Account information updated", "success");
  };

  const handlePasswordChange = async (data: any) => {
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details ? error.details.join(", ") : error.error);
    }

    addToast("Password changed successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-black text-white">Account Settings</h1>
        <p className="text-text-muted mt-xs">Manage your profile and security preferences</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-xl md:grid-cols-3">
        {/* Left Column - Profile & Info */}
        <div className="md:col-span-2 space-y-xl">
          {/* Profile Picture */}
          <ProfilePictureUpload
            currentImage={profile?.image}
            userName={profile?.name}
            onUpload={handleProfilePictureUpload}
          />

          {/* Account Information */}
          <AccountInfoForm
            initialData={{
              name: profile?.name,
              email: profile?.email,
              phone: profile?.phone,
            }}
            onSubmit={handleAccountInfoUpdate}
          />

          {/* Password Change */}
          <PasswordChangeForm onSubmit={handlePasswordChange} />
        </div>

        {/* Right Column - Activity & Status */}
        <div>
          <ActivitySummary
            lastLogin={profile?.lastLogin}
            accountCreated={profile?.createdAt}
            accountStatus="active"
          />
        </div>
      </div>
    </div>
  );
}
