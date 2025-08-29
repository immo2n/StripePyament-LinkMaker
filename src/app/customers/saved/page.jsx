"use client";

import { Shield, Lock } from "@phosphor-icons/react/dist/ssr";

function SecureEnrollmentInfo() {
  return (
    <div className="space-y-6">
      <h4 className="font-semibold mb-4 text-gray-900 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-blue-600" /> Secure Payment Method Enrollment
      </h4>
      <p className="text-sm text-gray-600">
        Your payment method will be securely stored and encrypted.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <div className="flex items-center mb-2">
          <Lock className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-900">SSL Encrypted</span>
        </div>
        <p className="text-xs text-blue-700">
          Your data is protected with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}

export default function PaymentSavedPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Column */}
      <div className="w-full lg:w-[45%] p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            Payment Method Saved!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you! Your payment details have been securely stored.
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden lg:block lg:w-[55%] p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <SecureEnrollmentInfo />
      </div>
    </main>
  );
}
