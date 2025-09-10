import { stripe } from "@/lib/clients/stripe/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { paymentLinkHash } = await req.json();

    const paymentLink = await prisma.paymentLink.findUnique({
      where: { paymentLinkHash },
    });

    if (!paymentLink) {
      return new Response(JSON.stringify({ error: "Invalid payment link" }), { status: 404 });
    }

    const amountInCents = Math.round(paymentLink.amount * 100);

    let paymentIntent;

    if (paymentLink.stripeIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(paymentLink.stripeIntentId);
        if (existingIntent && existingIntent.status !== "canceled") {
          paymentIntent = existingIntent;
        }
      } catch (err) {
        console.warn("Existing intent not found, creating new one...");
      }
    }

    if (!paymentIntent) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          custom_amount: paymentLink.amount.toString(),
          payment_link_id: paymentLink.paymentLinkHash,
        },
      });

      await prisma.paymentLink.update({
        where: { paymentLinkHash },
        data: {
          stripeIntentId: paymentIntent.id,
          stripeSecret: paymentIntent.client_secret,
        },
      });

      paymentLink.stripeIntentId = paymentIntent.id;
      paymentLink.stripeSecret = paymentIntent.client_secret;
    }

    return new Response(
      JSON.stringify({ paymentLink, clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
