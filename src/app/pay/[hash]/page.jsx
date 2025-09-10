"use client";

import { useEffect, useState } from "react";
import { StripeCheckoutForm } from "@/features/billing/components/checkout-form";

export default function PayPage({ params: promisedParams }) {
  const [params, setParams] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    promisedParams
      .then(setParams)
      .catch(() => setError("Failed to get params"));
  }, [promisedParams]);

  useEffect(() => {
    if (!params) return;
    const { hash } = params;

    async function fetchPayment() {
      try {
        const res = await fetch("/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentLinkHash: hash }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to fetch payment link");
          return;
        }
        const data = await res.json();
        setPaymentLink(data.paymentLink);
        setClientSecret(data.clientSecret);
      } catch {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    }

    fetchPayment();
  }, [params]);

  function PaymentSummary({ paymentLink }) {
    const {
      clientName,
      clientEmail,
      amount,
      refundable,
      itineraryUrl,
      createdAt,
    } = paymentLink;

    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-6 space-y-6">
        <div className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <img
            src={itineraryUrl}
            alt="Itinerary"
            className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        {clientName && clientEmail && (
          <div className="border-b pb-4 space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">Customer</h3>
            <p className="text-gray-700">{clientName}</p>
            <p className="text-gray-700">{clientEmail}</p>
          </div>
        )}
        <div className="border-b pb-4 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Payment Info</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Amount</span>
            <span className="text-xl font-bold text-gray-900">
              ${amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Refundable</span>
            <span
              className={`px-2 py-1 rounded-full text-sm font-semibold ${
                refundable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {refundable ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Created</span>
            <span className="text-gray-700 text-sm">
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p className="p-5">Loading payment gateway...</p>;
  if (error) return <p className="text-red-600 p-5">{error}</p>;
  if (!clientSecret || !paymentLink)
    return <p className="text-red-600 p-5">Payment data unavailable</p>;

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full lg:w-[45%] p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
          <p className="text-gray-600">
            Hello, {paymentLink.clientName || "Guest"}! Please complete your
            payment of{" "}
            <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ${paymentLink.amount}
            </span>
            .
          </p>
          <div className="mt-5">
            <StripeCheckoutForm
              amount={paymentLink.amount}
              clientSecret={paymentLink.stripeSecret}
            />
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-[55%] p-8">
        <PaymentSummary paymentLink={paymentLink} />
      </div>
    </div>
  );
}
