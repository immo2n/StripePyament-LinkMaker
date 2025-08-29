"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Plus,
  PlusCircle,
  Search,
  User2,
  UserPlus2,
} from "lucide-react";
import Image from "next/image";
import { EnvelopeIcon } from "@phosphor-icons/react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(1, query);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  async function fetchCustomers(page = 1, query = "") {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      if (query.trim()) {
        params.append("query", query.trim());
      }

      const res = await fetch(`/customers/list?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setCustomers(data.customers);
        setTotalPages(data.meta.totalPages);
      } else {
        console.error("Failed to fetch customers:", data.error);
        alert("Customer fetch failed, check internet connection!");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  /** Modal objects to add new customer */
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientRemarks: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [enrollHash, setEnrollHash] = useState(null);

  async function createCustomer() {
    if (addingCustomer) return;
    setModalMessage("Adding customer, please wait...");
    const { clientName, clientEmail, clientRemarks } = formData;

    if (!clientEmail || !validateEmail(clientEmail)) {
      setModalMessage("Please enter a valid email address.");
      return;
    }

    setAddingCustomer(true);
    const res = await fetch("/customers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clientName,
        email: clientEmail,
        remarks: clientRemarks,
      }),
    });

    const data = await res.json();
    setAddingCustomer(false);

    switch (res.status) {
      case 200:
        console.log("Customer created successfully:", data.customer);
        setModalMessage(data.status || "Customer created successfully!");

        fetchCustomers(1);
        setShowAddCustomer(false);
        setFormData({
          clientName: "",
          clientEmail: "",
          clientRemarks: "",
        });

        break;

      case 409:
        console.warn("Conflict:", data.error);
        setModalMessage(data.error || "Customer already exists!");
        break;

      case 500:
        console.error("Server error:", data.error);
        setModalMessage("Internal server error. Please try again later.");
        break;

      default:
        console.error("Unexpected response:", data);
        setModalMessage("Unexpected error occurred!");
    }
  }

  async function makeEnrollmentLink(customer) {
    if (makingLinkModal) return;
    setMakingLinkModal(true);
    setEnrollHash(null);
    setEnrollMessage("Making enrollment link for user...");

    const id = customer.stripeCustomerId;
    setEnrollName(customer.name);
    setEnrollEmail(customer.email);

    const res = await fetch("/customers/make-enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: id,
        email: customer.email,
      }),
    });
    const data = await res.json();
    setEnrollMessage("");
    switch (res.status) {
      case 200:
        if (data.enrollHash) {
          setEnrollHash(data.enrollHash);
        } else {
          setEnrollMessage("Server error, try again!");
        }
        break;
      case 500:
      case 400:
        console.error(data.error);
        setEnrollMessage("Server error: " + data.error);
        break;
    }
  }

  const [makingLinkModal, setMakingLinkModal] = useState(false);
  const [enrollName, setEnrollName] = useState("N/A");
  const [enrollEmail, setEnrollEmail] = useState("N/A");
  const [enrollMessage, setEnrollMessage] = useState("");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/** Header */}
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
                onClick={() => {
                  location.href = "/admin";
                }}
                variant="outline"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Main Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/** Page container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
          <p>
            All your customer information is also available in the official
            Stripe dashboard.{" "}
            <a
              href="https://dashboard.stripe.com/customers"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-900"
            >
              View in Stripe Dashboard
            </a>
            .
          </p>
        </div>

        {/** Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <Button
            onClick={() => {
              setShowAddCustomer(true);
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>

          <div className="flex items-center flex-1 max-w-md border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search customers... email, fullname, remarks"
              className="w-full outline-none bg-transparent text-sm text-gray-700"
            />
          </div>
        </div>

        {/** Customers List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading customers...
              {query.trim().length > 0 ? " for: " + query : ""}
            </div>
          ) : (
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm">
                      {(currentPage - 1) * itemsPerPage + (index + 1)}
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.name}</td>
                    <td className="px-4 py-3 text-sm">{customer.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {customer.paymentEnrolled ? (
                        <span className="text-green-700">Yes</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {customer.remarks ? (
                        customer.remarks
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        onClick={() => makeEnrollmentLink(customer)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        <PlusCircle /> Add Payment Method
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-gray-500 px-5">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </div>

        {/** Pagination */}
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

      {/** Add customer modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              Add New Customer
            </h2>

            {modalMessage.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                <p>{modalMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Required Fields */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Required Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="flex gap-1 block text-sm font-medium text-gray-700 mb-1">
                      <User2 className="h-5 w-5" /> Full name*
                    </label>
                    <Input
                      placeholder="Enter the full name of the customer"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="flex gap-1 block text-sm font-medium text-gray-700 mb-1">
                      <EnvelopeIcon className="h-5 w-5" /> Email*
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter a valid email of the customer"
                      value={formData.clientEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientEmail: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="flex gap-1 block text-sm font-medium text-gray-700 mb-1">
                      <MessageCircle className="h-5 w-5" /> Remarks (optional)
                    </label>
                    <Input
                      maxLength="250"
                      type="text"
                      placeholder="Additional info about the customer"
                      value={formData.clientRemarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientRemarks: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddCustomer(false);
                  setFormData({
                    clientName: "",
                    clientEmail: "",
                    clientRemarks: "",
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createCustomer}
                disabled={!formData.clientEmail}
                className={`flex-1 ${
                  addingCustomer
                    ? "bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {addingCustomer ? (
                  <div className="flex gap-1 items-center">
                    <Loader2 className="animate-spin" /> Adding Customer...
                  </div>
                ) : (
                  <div className="flex gap-1 items-center">
                    <UserPlus2 /> Add Customer
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/** Link modal */}
      {makingLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              Making enrollment link
            </h2>

            {enrollMessage.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                <p>{enrollMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              Name: {enrollName} <br />
              Email: {enrollEmail}
            </div>
            {enrollHash && enrollHash.length > 0 && (
              <>
                <div className="mt-5 mb-5 relative">
                  <input
                    type="text"
                    readOnly
                    value={`${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/customers/enroll/${enrollHash}`}
                    onClick={(e) => e.target.select()} // auto-select text
                    className="w-full pr-10 p-3 rounded-lg border border-green-300 bg-green-50 text-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
                  />
                  <Copy
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-green-600 hover:text-green-800"
                    size={18}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/customers/enroll/${enrollHash}`
                      );
                      setEnrollMessage("Copied to clipboard!");
                    }}
                  />
                </div>
                <div className="text-sm">
                  Share this link with the user so they can enroll their payment
                  method, valid for 30 minutes from creation.
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setMakingLinkModal(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
