import { NextResponse } from "next/server";
import { stripe } from "@/lib/clients/stripe/server";
import { getPaymentLinkById, updatePaymentLinkWithIntent } from "@/lib/payment-links";
import { getBaseUrl } from "@/lib/config";
import { z } from "zod";

const createPaymentIntentSchema = z.object({
	amount: z.number().min(1, "Amount must be at least $1").max(999999, "Amount too large"),
	paymentLinkId: z.string().optional(),
});

export async function POST(request: Request) {
	console.log("=== Payment Intent Creation Started ===");
	
	try {
		console.log("1. Parsing request body...");
		const body = await request.json();
		console.log("Request body:", JSON.stringify(body, null, 2));
		
		console.log("2. Validating request schema...");
		const result = createPaymentIntentSchema.safeParse(body);

		if (!result.success) {
			console.error("Schema validation failed:", result.error.issues);
			return NextResponse.json(
				{
					error: "Invalid request",
					details: result.error.issues,
				},
				{ status: 400 }
			);
		}

		const { amount, paymentLinkId } = result.data;
		console.log("Validated data - Amount:", amount, "PaymentLinkId:", paymentLinkId);

		// If we have a payment link ID, check if there's already a valid PaymentIntent
		if (paymentLinkId) {
			const paymentLink = getPaymentLinkById(paymentLinkId);
			
			if (paymentLink?.paymentIntentId && paymentLink?.paymentIntentClientSecret) {
				try {
					// Check if the existing PaymentIntent is still valid
					const existingIntent = await stripe.paymentIntents.retrieve(paymentLink.paymentIntentId);
					
					// If it's still in a usable state and has the same amount, reuse it
					if (
						existingIntent.status === 'requires_payment_method' &&
						existingIntent.amount === Math.round(amount * 100)
					) {
						return NextResponse.json({
							clientSecret: paymentLink.paymentIntentClientSecret,
						});
					}
				} catch (error) {
					// If retrieval fails, we'll create a new one
					console.log('Existing PaymentIntent not found or invalid, creating new one');
				}
			}
		}

		// Convert dollars to cents for Stripe
		const amountInCents = Math.round(amount * 100);
		console.log("3. Creating Stripe PaymentIntent with amount:", amountInCents, "cents");

		console.log("4. Calling Stripe API...");
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: "usd",
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				custom_amount: amount.toString(),
				payment_link_id: paymentLinkId || '',
			},
		});

		console.log("5. Stripe PaymentIntent created successfully:", paymentIntent.id);

		// Store the PaymentIntent info with the payment link
		if (paymentLinkId && paymentIntent.client_secret) {
			updatePaymentLinkWithIntent(
				paymentLinkId, 
				paymentIntent.id, 
				paymentIntent.client_secret
			);
		}

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error("Error creating payment intent:", error);
		
		// Log detailed error information
		if (error instanceof Error) {
			console.error("Error name:", error.name);
			console.error("Error message:", error.message);
			console.error("Error stack:", error.stack);
		}
		
		// Check if it's a Stripe error
		if (error && typeof error === 'object' && 'type' in error) {
			console.error("Stripe error type:", (error as any).type);
			console.error("Stripe error code:", (error as any).code);
			console.error("Stripe error message:", (error as any).message);
		}

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Validation error",
					details: error.issues,
				},
				{ status: 400 }
			);
		}

		// Return more detailed error information
		return NextResponse.json(
			{ 
				error: "Failed to create payment intent",
				details: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
}
