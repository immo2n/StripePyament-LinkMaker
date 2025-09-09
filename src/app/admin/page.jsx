"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, LayoutDashboard, Loader2, Search, Trash2 } from "lucide-react";
import Image from "next/image";

import { CreditCard, Plus, Trash, Eye, Gear } from "@phosphor-icons/react";

import { User2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import ItineraryCell from "@/components/ItineraryCell";

export default function AdminPage() {
  const [links, setLinks] = useState([]);
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [settingsData, setSettingsData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });


  const [itinaryBase64, setItinaryBase64] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    itinerary: "",
    refundable: false,
    clientName: "",
    clientEmail: "",
  });

  const [settingsError, setSettingsError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleUpdateCredentials = async () => {
    setSettingsError("");

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

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    window.location.href = "/login";
  };

  useEffect(() => {
    const authToken = localStorage.getItem("adminAuth");
    if (authToken !== "true") {
      window.location.href = "/login";
    } else {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLinks(1, query);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  async function fetchLinks(page = 1, query = "") {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      if (query.trim()) {
        params.append("query", query.trim());
      }

      const res = await fetch(`/admin/list?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLinks(data.links);
        setTotalPages(data.meta.totalPages);
      } else {
        alert("Failed to fetch links!");
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLinks(currentPage);
  }, [currentPage]);

  async function deleteLink(linkId) {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`/admin/delete-links/${linkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLinks((prev) => prev.filter((link) => link.id !== linkId));
      } else {
        alert("Failed to delete link!");
      }
    } catch (error) {
      console.error("Delete link error:", error);
    }
  }

  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setItinaryBase64(ev.target.result);
      setFormData({ ...formData, itinerary: file });
    };
    reader.readAsDataURL(file);
  }

  async function createPaymentLink() {
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      showToast("Please enter a valid payment amount!", "error");
      return;
    }

    if (formData.refundable === undefined || formData.refundable === null) {
      showToast("Please select whether the payment is refundable.", "error");
      return;
    }

    if (!formData.itinerary) {
      showToast("Please attach or paste an itinerary image.", "error");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("refundable", formData.refundable);
    formDataToSend.append("clientName", formData.clientName);
    formDataToSend.append("clientEmail", formData.clientEmail);
    formDataToSend.append("itinerary", formData.itinerary);

    setCreatingLink(true);
    try {
      const response = await fetch("/admin/api/payment-links", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      setCreatingLink(false);

      if (!response.ok) {
        showToast(result.error || "Failed to create payment link.", "error");
        return;
      }

      showToast("Payment link created successfully!", "success");
      console.log(result);
      fetchLinks(1);
      setShowCreateForm(false);
    } catch (error) {
      showToast("Failed to create payment link. Please try again.", "error");
    }
  }

  if (!authenticated) return null;

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
                  location.href = "/customers";
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

      {/** Page Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center flex-1 max-w-md border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search links... by email, amount, or ID"
              className="w-full outline-none bg-transparent text-sm text-gray-700"
            />
          </div>
        </div>

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

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading payment links...
              {query.trim().length > 0 ? ` for: ${query}` : ""}
            </div>
          ) : links.length === 0 ? (
            <div className="p-16 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <CreditCard className="relative w-16 h-16 text-gray-400 mx-auto mb-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No payment links yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Create your first payment link to start accepting payments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      👤 Client
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      🛠 Service
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
                  {links.map((link, index) => (
                    <tr
                      key={link.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group"
                    >
                      <td className="px-8 py-6 text-sm font-medium text-gray-700">
                        {(currentPage - 1) * itemsPerPage + (index + 1)}
                      </td>

                      {/* Client */}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                            {link.clientName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {link.clientName || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {link.clientEmail || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {link.itineraryUrl && (
                              <ItineraryCell
                                itineraryUrl={"/api/" + link.itineraryUrl}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${link.amount.toFixed(2)}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {new Date(link.createdAt).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `${window.location.origin}/pay/${link.hash}`
                              )
                            }
                            className="bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLink(link.id)}
                            className="bg-white/80 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>

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
      {/* Create Form Modal */}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Create Payment Link
            </h2>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-4">
                {/* Required Fields */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Required Information
                  </h3>
                  <div className="space-y-3">
                    {/* Amount */}
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

                    {/* Itinerary Upload/Paste/DragDrop */}
                    <div
                      tabIndex={0}
                      className={`border-2 border-dashed rounded-lg p-4 text-center relative transition-colors ${
                        isFocused ? "border-blue-500" : "border-gray-300"
                      }`}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload(file);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onPaste={(e) => {
                        const item = [...e.clipboardData.items].find(
                          (i) => i.type.indexOf("image") !== -1
                        );
                        if (item) {
                          const file = item.getAsFile();
                          handleFileUpload(file);
                        }
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        Drag & drop, paste screenshot (Ctrl+V), or{" "}
                        <button
                          type="button"
                          className="text-blue-600 underline"
                          onClick={() =>
                            document.getElementById("fileInput").click()
                          }
                        >
                          browse files
                        </button>
                      </p>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                      />
                      {itinaryBase64 ? (
                        <div className="relative mt-2">
                          <img
                            src={itinaryBase64}
                            alt="Itinerary Preview"
                            className="rounded-lg border w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() =>
                              setFormData({ ...formData, itinerary: "" })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Refundable Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Is Payment Refundable? *
                      </label>
                      <select
                        value={
                          formData.refundable === undefined
                            ? "no"
                            : formData.refundable
                            ? "yes"
                            : "no"
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refundable: e.target.value === "yes",
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="no">Non-Refundable</option>
                        <option value="yes">Refundable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional Fields */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Customer Information (Optional)
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Name
                      </label>
                      <Input
                        placeholder="John Doe"
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
                        Customer Email
                      </label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
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
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createPaymentLink()}
                disabled={
                  creatingLink ||
                  !formData.amount ||
                  !formData.itinerary ||
                  formData.refundable === undefined
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {creatingLink ? "Creating..." : "Create Link"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}