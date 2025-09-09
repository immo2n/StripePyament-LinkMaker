import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const amount = parseFloat(formData.get("amount"));
    const refundable = formData.get("refundable") === "true";
    const clientName = formData.get("clientName") || null;
    const clientEmail = formData.get("clientEmail") || null;
    const itineraryBase64 = formData.get("itinerary");

    /** Optional customer ID */
    const customerIdRaw = formData.get("customerId");
    const customerId = customerIdRaw ? parseInt(customerIdRaw) : null;

    if (!amount || !itineraryBase64) {
      return NextResponse.json(
        { error: "Amount and itinerary are required" },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Decode Base64
    const base64Data = itineraryBase64.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate random filename
    const randomString = crypto.randomBytes(6).toString("hex");
    const fileName = `${Date.now()}-${randomString}.png`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Generate unique hashes/secrets
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
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
