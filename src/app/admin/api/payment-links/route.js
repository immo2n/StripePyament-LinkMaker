// app/admin/api/payment-links/route.js
import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

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

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate random filename
    const randomString = crypto.randomBytes(6).toString("hex");
    const fileName = `${Date.now()}-${randomString}.jpeg`;
    const filePath = path.join(uploadDir, fileName);

    // Compress & save as JPEG 90%
    const buffer = Buffer.from(await itineraryFile.arrayBuffer());
    await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(filePath);

    // Generate hashes/secrets
    const paymentLinkHash = crypto.randomBytes(12).toString("hex");
    const stripeSecret = crypto.randomBytes(16).toString("hex");

    // Save to database
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
