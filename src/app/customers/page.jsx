"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Plus, Search, User2 } from "lucide-react";
import Image from "next/image";
import { email } from "zod/v4";
import { EnvelopeIcon } from "@phosphor-icons/react";

export default function Customers() {
  // Generate dummy customer data
  const generateCustomers = (count = 100) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
    }));
  };

  const allCustomers = generateCustomers();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const totalPages = Math.ceil(allCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = allCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /** Modal objects to add new customer */
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: ""
  });

  async function createCustomer() {
    const res = await fetch("/customers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jenny Rosen",
        email: "jennyrosen@example.com",
      }),
    });

    const data = await res.json();
    console.log(data);




    
  }

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
                
                createCustomer()
                    
                    return;
                
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
              type="text"
              placeholder="Search customers... email, fullname"
              className="w-full outline-none bg-transparent text-sm text-gray-700"
            />
          </div>
        </div>

        {/** Customers List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                  ID
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">{customer.id}</td>
                  <td className="px-4 py-3 text-sm">{customer.name}</td>
                  <td className="px-4 py-3 text-sm">{customer.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Add New Customer
            </h2>

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
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowAddCustomer(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {}}
                disabled={!formData.clientEmail || !formData.clientEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
