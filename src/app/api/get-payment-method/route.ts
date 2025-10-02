import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/clients/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    console.log("Received payment intent ID:", paymentIntentId);

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the payment intent with expanded payment method
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method']
    });
    console.log("Payment intent retrieved:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      payment_method: paymentIntent.payment_method
    });
    
    if (!paymentIntent.payment_method) {
      return NextResponse.json(
        { error: "No payment method found" },
        { status: 404 }
      );
    }

    // Get the payment method (already expanded)
    const paymentMethod = paymentIntent.payment_method as any;
    console.log("Payment method retrieved:", {
      id: paymentMethod?.id,
      type: paymentMethod?.type,
      card: paymentMethod?.card
    });

    // Return only the safe card details
    const cardDetails = paymentMethod?.card ? {
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      exp_month: paymentMethod.card.exp_month,
      exp_year: paymentMethod.card.exp_year,
    } : null;

    console.log("Card details extracted:", cardDetails);

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        card: cardDetails,
        billing_details: paymentMethod.billing_details,
      }
    });

  } catch (error) {
    console.error("Error retrieving payment method:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to retrieve payment method", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
