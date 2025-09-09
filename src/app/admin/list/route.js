// app/api/links/list/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // make sure this points to your Prisma client

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const totalItems = await prisma.paymentLink.count();

    // Fetch paginated payment links
    const links = await prisma.paymentLink.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        refundable: true,
        clientName: true,
        clientEmail: true,
        itineraryUrl: true,
        paymentLinkHash: true,
        successful: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      links,
      meta: {
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        currentPage: page,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
