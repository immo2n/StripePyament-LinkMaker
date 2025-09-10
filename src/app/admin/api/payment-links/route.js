import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/clients/stripe/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const amount = parseFloat(formData.get("amount"));
    const refundable = formData.get("refundable") === "true";
    const clientName = formData.get("clientName") || null;
    const clientEmail = formData.get("clientEmail") || null;
    const itineraryFile = formData.get("itinerary"); // a real File

    const customerIdRaw = formData.get("customerId");
    const customerId = customerIdRaw ? parseInt(customerIdRaw) : null;

    if (!amount || !itineraryFile || !itineraryFile.size) {
      return NextResponse.json(
        { error: "Amount and itinerary file are required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const randomString = crypto.randomBytes(6).toString("hex");
    const fileName = `${Date.now()}-${randomString}.jpeg`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await itineraryFile.arrayBuffer());
    await sharp(buffer).jpeg({ quality: 90 }).toFile(filePath);

    const paymentLinkHash = crypto.randomBytes(12).toString("hex");
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        custom_amount: amount.toString(),
        payment_link_id: paymentLinkHash,
      },
    });

    if (!paymentIntent.id || !paymentIntent.client_secret) {
      return NextResponse.json({ error: "Stripe error" }, { status: 500 });
    }

    console.log("Stripe PaymentIntent created successfully:", paymentIntent.id);
    console.log("Stripe PaymentIntent created successfully:", paymentIntent.client_secret);
    const stripeSecret = paymentIntent.client_secret;
    const stripeIntentId = paymentIntent.id;

    const paymentLink = await prisma.paymentLink.create({
      data: {
        customerId,
        amount,
        refundable,
        clientName,
        clientEmail,
        itineraryUrl: `/uploads/${fileName}`,
        paymentLinkHash,
        stripeSecret,
        stripeIntentId
      },
    });

    return NextResponse.json({
      message: "Payment link created successfully",
      data: paymentLink,
      paymentUrl: `/pay/${paymentLinkHash}`,
    });
  } catch (error) {
    console.error("Payment link creation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
