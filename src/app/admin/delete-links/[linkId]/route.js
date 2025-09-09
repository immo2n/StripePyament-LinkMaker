import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(req, context) {
  // await params before destructuring
  const params = await context.params;
  const { linkId } = params;

  if (!linkId) {
    return NextResponse.json({ error: "Link ID is required" }, { status: 400 });
  }

  try {
    // Find the payment link first to get the file path
    const link = await prisma.paymentLink.findUnique({
      where: { id: parseInt(linkId) },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Delete the itinerary file
    if (link.itineraryUrl) {
      const filePath = path.join(process.cwd(), "public", link.itineraryUrl);
      try {
        await unlink(filePath);
      } catch (err) {
        console.warn("Failed to delete file:", err);
      }
    }

    // Delete the database record
    const deletedLink = await prisma.paymentLink.delete({
      where: { id: parseInt(linkId) },
    });

    return NextResponse.json({
      message: "Payment link and itinerary file deleted successfully",
      data: deletedLink,
    });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
