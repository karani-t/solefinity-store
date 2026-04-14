"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

interface LoginRecord {
  id: string;
  name: string;
  email: string;
  lastLogin: string | null;
  createdAt: string;
}

export default function LoginHistoryPage() {
  const { data: session, status } = useSession();
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"lastLogin" | "name" | "createdAt">(
    "lastLogin"
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      redirect("/");
    }
    fetchLoginHistory();
  }, [session, status]);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/login-history");
      if (response.ok) {
        const data = await response.json();
        setLogins(data.loginHistory || []);
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStatus = (lastLogin: string | null) => {
    if (!lastLogin) return "Never";
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}m ago`;
  };

  const getStatusColor = (lastLogin: string | null) => {
    if (!lastLogin) return "bg-gray-100 text-gray-800";
    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "bg-green-100 text-green-800";
    if (diffDays < 7) return "bg-yellow-100 text-yellow-800";
    if (diffDays < 30) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const filteredLogins = logins
    .filter(
      (login) =>
        login.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        login.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "lastLogin") {
        const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return bTime - aTime;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/admin" className="hover:text-gray-900">
                Admin
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Login History</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Login History</h1>
          <p className="text-gray-600">Monitor user access patterns and activity</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search User
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "lastLogin" | "name" | "createdAt")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lastLogin">Last Login (Recent First)</option>
              <option value="name">Name (A-Z)</option>
              <option value="createdAt">Join Date (Recent First)</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{logins.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Active Today</p>
            <p className="text-2xl font-bold text-green-600">
              {logins.filter((l) => l.lastLogin && getActiveStatus(l.lastLogin) === "Today").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Inactive (30+ days)</p>
            <p className="text-2xl font-bold text-red-600">
              {
                logins.filter((l) => {
                  if (!l.lastLogin) return true;
                  const diffDays = Math.floor(
                    (new Date().getTime() - new Date(l.lastLogin).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return diffDays >= 30;
                }).length
              }
            </p>
          </div>
        </div>

        {/* Login History Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLogins.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member Since
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogins.map((login) => (
                    <tr key={login.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {login.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{login.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {login.lastLogin
                            ? new Date(login.lastLogin).toLocaleString()
                            : "Never"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            login.lastLogin
                          )}`}
                        >
                          {getActiveStatus(login.lastLogin)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(login.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Activity Status Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              <span className="text-blue-800">Active Today</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              <span className="text-blue-800">Active This Week</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
              <span className="text-blue-800">Active This Month</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
              <span className="text-blue-800">Inactive 30+ Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
