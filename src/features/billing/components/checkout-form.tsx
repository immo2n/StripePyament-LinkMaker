"use client";

import * as React from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/clients/stripe/browser";
import { Input } from "@/components/ui/input";

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const [cardholderName, setCardholderName] = React.useState<string>("");
  const [cardholderEmail, setCardholderEmail] = React.useState<string>("");
  const [paymentType, setPaymentType] = React.useState<string>("");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("initial");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const stripe = useStripe();
  const elements = useElements();

  const getButtonText = (status: string) => {
    switch (status) {
      case "processing":
      case "requires_payment_method":
      case "requires_confirmation":
        return "Processing...";
      case "requires_action":
        return "Authenticating...";
      case "succeeded":
        return "Payment Succeeded 🎉";
      case "error":
        return "Try Again";
      default:
        return "Pay Now";
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.currentTarget.name === "cardholderName")
      setCardholderName(e.currentTarget.value);
    else if (e.currentTarget.name === "cardholderEmail")
      setCardholderEmail(e.currentTarget.value);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity() || !elements || !stripe) return;

    setPaymentStatus("processing");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          payment_method_data: {
            billing_details: { name: cardholderName, email: cardholderEmail },
          },
        },
      });

      if (confirmError) throw confirmError;

      setPaymentStatus("succeeded");
    } catch (err) {
      setPaymentStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="elements-style">
        {paymentType === "card" && (
          <>
            <Input
              placeholder="Cardholder name"
              className="elements-style mb-4"
              type="text"
              name="cardholderName"
              onChange={handleInputChange}
              required
            />
            <Input
              placeholder="Email"
              value={cardholderEmail}
              className="elements-style mb-4"
              type="email"
              name="cardholderEmail"
              onChange={handleInputChange}
            />
          </>
        )}
        <div className="FormRow elements-style">
          <PaymentElement
            options={{
              defaultValues: {
                billingDetails: {
                  name: cardholderName,
                  email: cardholderEmail,
                },
              },
            }}
            onChange={(e) => setPaymentType(e.value.type)}
          />
        </div>
      </fieldset>
      <Button
        color={paymentStatus === "error" ? "danger" : "primary"}
        className="w-full mt-4"
        type="submit"
        disabled={
          !stripe || ["processing", "requires_action"].includes(paymentStatus)
        }
      >
        {getButtonText(paymentStatus)}
      </Button>
      {paymentStatus === "error" && (
        <p className="text-danger text-sm mt-2">{errorMessage}</p>
      )}
    </form>
  );
}

export function StripeCheckoutForm({
  amount,
  clientSecret,
}: {
  amount: number;
  clientSecret: string;
}) {
  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          variables: {
            colorIcon: "#6772e5",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          },
        }
      }}
    >
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
}
