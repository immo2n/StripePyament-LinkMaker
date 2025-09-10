import { prisma } from "@/lib/prisma";
import {
  User,
  EnvelopeSimple,
  ArrowClockwise,
  Calendar,
  Shield,
  Lock
} from "@phosphor-icons/react/dist/ssr";
import { StripeCheckoutForm } from "@/features/billing/components/checkout-form";
import { stripe } from "@/lib/clients/stripe/server";

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
      {/* Itinerary / Product Image */}
      <div className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <img
          src={itineraryUrl}
          alt="Itinerary"
          className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Customer Info */}
      {clientName && clientEmail && (
        <div className="border-b pb-4 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Customer</h3>
          <p className="text-gray-700 flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" /> {clientName}
          </p>
          <p className="text-gray-700 flex items-center">
            <EnvelopeSimple className="w-4 h-4 mr-2 text-gray-500" />{" "}
            {clientEmail}
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="border-b pb-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Payment Info</h3>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Amount</span>
          <span className="text-xl font-bold text-gray-900">
            ${amount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center text-gray-600 font-medium">
            Refundable <ArrowClockwise className="w-4 h-4 ml-1 text-gray-500" />
          </span>
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
          <span className="flex items-center text-gray-600 font-medium">
            Created <Calendar className="w-4 h-4 ml-1 text-gray-500" />
          </span>
          <span className="text-gray-700 text-sm">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Secure Payment Info */}
      <div className="bg-blue-50 rounded-xl p-4 shadow-inner space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Secure Payment
        </h3>
        <p className="text-sm text-gray-700">
          Your payment is encrypted and processed securely.
        </p>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-800">256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

export default async function Pay({ params }) {
  const { hash } = params;

  const paymentLink = await prisma.paymentLink.findUnique({
    where: { paymentLinkHash: hash },
  });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentLink.stripeIntentId);
    console.log(paymentIntent);
  }
  catch(e){
    console.log(e);
  }

  if (!paymentLink) {
    return <p className="p-8 text-red-600">Invalid or expired payment link.</p>;
  }

  return (
    <main className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left side: payment form */}
      <div className="w-full lg:w-[45%] p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
          <p className="text-gray-600">
            Hello, {paymentLink.clientName || "Guest"}! Please complete your
            payment of  <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${paymentLink.amount}</span>.
          </p>
          <div className="mt-5">
            <StripeCheckoutForm
              amount={paymentLink.amount}
              clientSecret={paymentLink.stripeSecret}
            />
          </div>
        </div>
      </div>

      {/* Right side: payment summary */}
      <div className="hidden lg:block lg:w-[55%] p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <PaymentSummary paymentLink={paymentLink} />
      </div>
    </main>
  );
}
