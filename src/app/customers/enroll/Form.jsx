import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const EnrollForm = ({
  hash
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/customers/save/${hash}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded-lg text-white font-semibold 
          ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} 
          transition-colors`}
      >
        {loading ? "Processing..." : "Submit Payment Method"}
      </button>
    </form>
  );
};

export default EnrollForm;
