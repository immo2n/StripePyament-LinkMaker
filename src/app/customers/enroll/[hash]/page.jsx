"use client";

import { getStripe } from "@/lib/clients/stripe/browser";
import { use } from "react";
import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import EnrollForm from "../Form";
import { Shield, Lock } from "@phosphor-icons/react/dist/ssr";

function SecureEnrollmentInfo() {
  return (
    <div className="space-y-6">
      {" "}
      <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
        {" "}
        <Shield className="w-5 h-5 mr-2 text-blue-600" /> Secure Payment Method
        Enrollment{" "}
      </h4>{" "}
      <p className="text-sm text-gray-600">
        {" "}
        Your payment method will be securely stored and encrypted.{" "}
      </p>{" "}
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        {" "}
        <div className="flex items-center mb-2">
          {" "}
          <Lock className="w-4 h-4 text-blue-600 mr-2" />{" "}
          <span className="text-sm font-medium text-blue-900">
            {" "}
            SSL Encrypted{" "}
          </span>{" "}
        </div>{" "}
        <p className="text-xs text-blue-700">
          {" "}
          Your data is protected with 256-bit SSL encryption{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}

export default function PaymentMethodEnrollmentPage({ params }) {
  const { hash } = use(params);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hash || hash.trim().length === 0) {
      setError("Invalid link.");
      setLoading(false);
      return;
    }

    fetch(`/api/customers/enroll/${hash}`)
      .then((res) => {
        if (!res.ok) throw new Error("Customer not found.");
        return res.json();
      })
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hash]);

  if (loading) {
    return <p className="p-8 text-gray-600">Loading enrollment details...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  const options = {
    clientSecret: customer.enrollmentSecret,
  };

  const stripe = getStripe();

  return (
    <main className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="w-full lg:w-[45%] p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            Enroll Your Payment Method
          </h1>
          <p className="text-gray-600">
            Hello, {customer.name || "Valued Customer"}!
          </p>

          <div className="mt-5">
            <Elements stripe={stripe} options={options}>
              <EnrollForm hash={hash} />
            </Elements>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-[55%] p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <SecureEnrollmentInfo />
      </div>
    </main>
  );
}
