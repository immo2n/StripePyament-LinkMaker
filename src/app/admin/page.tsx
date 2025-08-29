"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  CreditCard,
  Copy,
  Plus,
  Trash,
  Eye,
  Gear,
} from "@phosphor-icons/react";
import Image from "next/image";
import { User2 } from "lucide-react";

interface PaymentLink {
  id: string;
  service: string;
  reason: string;
  amount: number;
  clientName: string;
  clientEmail: string;
  createdAt: string;
  link: string;
}

export default function AdminPage() {
  const { showToast } = useToast();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    service: "",
    reason: "",
    amount: "",
    clientName: "",
    clientEmail: "",
  });
  const [settingsData, setSettingsData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [settingsError, setSettingsError] = useState("");

  // Check authentication
  React.useEffect(() => {
    const authToken = localStorage.getItem("adminAuth");
    if (authToken === "true") {
      setIsAuthenticated(true);
    } else {
      window.location.href = "/login";
    }
    setLoading(false);
  }, []);

  const generatePaymentLink = async () => {
    try {
      const response = await fetch("/api/payment-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const newPaymentLink = await response.json();
      setPaymentLinks((prev) => [...prev, newPaymentLink]);
      setFormData({
        service: "",
        reason: "",
        amount: "",
        clientName: "",
        clientEmail: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating payment link:", error);
      showToast("Failed to create payment link. Please try again.", "error");
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast("Payment link copied to clipboard!", "success", {
      showCopyButton: false,
    });
  };

  const deletePaymentLink = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-links?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment link");
      }

      setPaymentLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting payment link:", error);
      showToast("Failed to delete payment link. Please try again.", "error");
    }
  };

  // Load payment links on component mount
  React.useEffect(() => {
    if (isAuthenticated) {
      const fetchPaymentLinks = async () => {
        try {
          const response = await fetch("/api/payment-links");
          if (response.ok) {
            const links = await response.json();
            setPaymentLinks(links);
          }
        } catch (error) {
          console.error("Error fetching payment links:", error);
        }
      };
      fetchPaymentLinks();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    window.location.href = "/login";
  };

  const handleUpdateCredentials = async () => {
    setSettingsError("");

    // Validation
    if (settingsData.password !== settingsData.confirmPassword) {
      setSettingsError("Passwords do not match");
      return;
    }

    if (settingsData.password.length < 6) {
      setSettingsError("Password must be at least 6 characters long");
      return;
    }

    if (settingsData.username.length < 3) {
      setSettingsError("Username must be at least 3 characters long");
      return;
    }

    try {
      const response = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: settingsData.username,
          password: settingsData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear form and close modal
        setSettingsData({ username: "", password: "", confirmPassword: "" });
        setShowSettings(false);

        // Show success message and logout
        showToast(
          "Credentials updated successfully! You will be logged out.",
          "success"
        );
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setSettingsError(data.error || "Failed to update credentials");
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      setSettingsError("Failed to update credentials. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src="/abc.png"
                  alt="Logo"
                  width={150}
                  height={50}
                  className="h-12 w-auto mr-4 drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your payment links
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>

              <Button
                onClick={() => {
					location.href = "/customers"
				}}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <User2 className="w-4 h-4 mr-2" />
                Customers
              </Button>

              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <Gear className="w-4 h-4 mr-2" />
                Settings
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Create Payment Link
              </h2>

              <div className="space-y-4">
                {/* Required Fields */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Required Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Description *
                      </label>
                      <Input
                        placeholder="Website Development, Logo Design, Consulting..."
                        value={formData.service}
                        onChange={(e) =>
                          setFormData({ ...formData, service: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Reason *
                      </label>
                      <textarea
                        placeholder="Final payment for project completion, Monthly retainer..."
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData({ ...formData, reason: e.target.value })
                        }
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ($) *
                      </label>
                      <Input
                        type="number"
                        placeholder="1500.00"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        step="0.01"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Client Information (Optional)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Add client details for better organization and personalized
                    checkout experience
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <Input
                        placeholder="John Doe (optional)"
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Email
                      </label>
                      <Input
                        type="email"
                        placeholder="john@example.com (optional)"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePaymentLink}
                  disabled={!formData.service || !formData.amount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Generate Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Admin Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Username
                  </label>
                  <Input
                    placeholder="Enter new username"
                    value={settingsData.username}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        username: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={settingsData.password}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={settingsData.confirmPassword}
                    onChange={(e) =>
                      setSettingsData({
                        ...settingsData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                {settingsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{settingsError}</p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Changing credentials will log you
                    out. Make sure to remember your new login details.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsData({
                      username: "",
                      password: "",
                      confirmPassword: "",
                    });
                    setSettingsError("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateCredentials}
                  disabled={
                    !settingsData.username ||
                    !settingsData.password ||
                    !settingsData.confirmPassword
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Update Credentials
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Links Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-white/30">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🔗 Payment Links
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your payment links
            </p>
          </div>

          {paymentLinks.length === 0 ? (
            <div className="p-16 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <CreditCard className="relative w-16 h-16 text-gray-400 mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No payment links yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Create your first payment link to start accepting payments from
                your clients
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      👤 Client
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      🛠️ Service
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      💰 Amount
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      📅 Created
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      ⚡ Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {paymentLinks.map((link) => (
                    <tr
                      key={link.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                            {link.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {link.clientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {link.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {link.service}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {link.reason}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${link.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {link.createdAt}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(link.link)}
                            className="bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(link.link, "_blank")}
                            className="bg-white/80 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePaymentLink(link.id)}
                            className="bg-white/80 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
