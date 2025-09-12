import { prisma } from "@/lib/prisma";
import Image from "next/image";

type SuccessPageSearchParams = {
  redirect_status?: string;
  payment_intent?: string;
  payment_intent_client_secret?: string;
};

const SuccessSVG = (
  <svg
    className="w-12 h-12 text-emerald-600"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M128 24C66.393 24 16 74.393 16 136s50.393 112 112 112 112-50.393 112-112S189.607 24 128 24zm52 84-60 60a12 12 0 0 1-17 0l-28-28a12 12 0 1 1 17-17l19 19 51-51a12 12 0 1 1 17 17z" />
  </svg>
);

const FailureSVG = (
  <svg
    className="w-12 h-12 text-red-600"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M128 24C66.393 24 16 74.393 16 136s50.393 112 112 112 112-50.393 112-112S189.607 24 128 24zm45 141a12 12 0 0 1-17 17L128 153l-28 29a12 12 0 0 1-17-17l29-28-29-28a12 12 0 1 1 17-17l28 29 28-29a12 12 0 0 1 17 17l-29 28 29 28z" />
  </svg>
);

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: SuccessPageSearchParams;
}) {
  const redirect_status = searchParams?.redirect_status;
  const payment_intent = searchParams?.payment_intent;

  if (redirect_status === "succeeded" && payment_intent) {
    // First, check if the record exists
    const existing = await prisma.paymentLink.findFirst({
      where: { stripeIntentId: payment_intent },
      select: { id: true, stripeIntentId: true, successful: true },
    });

    console.log("Existing record:", existing);

    if (existing) {
      const result = await prisma.paymentLink.updateMany({
        where: { stripeIntentId: payment_intent },
        data: { successful: true },
      });
      console.log("Update result:", result);
    } else {
      console.log("No matching record found for stripeIntentId:", payment_intent);
    }
  }

  const status =
    redirect_status === "succeeded"
      ? "succeeded"
      : redirect_status === "failed"
      ? "failed"
      : "unknown";

  const bgClass =
    status === "succeeded"
      ? "bg-gradient-to-br from-emerald-50 to-teal-50"
      : status === "failed"
      ? "bg-gradient-to-br from-red-50 to-pink-50"
      : "bg-gradient-to-br from-gray-50 to-gray-100";

  const borderClass =
    status === "succeeded"
      ? "border-emerald-100"
      : status === "failed"
      ? "border-red-100"
      : "border-gray-200";

  return (
    <div className={`min-h-screen w-full ${bgClass}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <Image
            src="/abc.png"
            alt="Logo"
            width={180}
            height={60}
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="py-20 px-4 flex justify-center">
        <div className="max-w-lg text-center">
          <div
            className={`bg-white rounded-2xl shadow-xl p-8 border ${borderClass}`}
          >
            <div className="mb-8">
              <div
                className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    status === "succeeded"
                      ? "#d1fae5"
                      : status === "failed"
                      ? "#fee2e2"
                      : "#e5e7eb",
                }}
              >
                {status === "succeeded" && SuccessSVG}
                {status === "failed" && FailureSVG}
              </div>

              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {status === "succeeded"
                  ? "Payment Successful!"
                  : status === "failed"
                  ? "Payment Failed"
                  : "Invalid Payment"}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {status === "succeeded"
                  ? "Your payment has been processed successfully. Thank you!"
                  : status === "failed"
                  ? "Unfortunately, your payment could not be processed. Please try again or contact support."
                  : "This payment link is invalid or has expired."}
              </p>

              {status === "succeeded" && payment_intent && (
                <div className="bg-emerald-50 rounded-lg p-4 mb-6 text-sm text-emerald-800">
                  Transaction ID: {payment_intent} <br />
                  Please save this ID for your records
                </div>
              )}

              {status === "succeeded" && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
                  🔒 Your payment was processed securely
                  <br />
                  📧 You will receive a confirmation email shortly
                  <br />
                  📞 Contact us if you have any questions
                </div>
              )}

              {status === "failed" && (
                <div className="bg-red-50 rounded-lg p-4 mb-6 text-sm text-red-700">
                  No charges were made to your account
                </div>
              )}
            </div>

            {status === "succeeded" && (
              <p className="text-gray-500 text-sm mt-4 text-center">
                Please close this window/tab to finish.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
