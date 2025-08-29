import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { hash } = params;

  if (!hash || hash.trim().length === 0) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  const expirationThreshold = new Date(Date.now() - 30 * 60 * 1000);

  const customer = await prisma.customer.findFirst({
    where: {
      enrollmentLinkHash: hash,
      enrollHashTimestamp: {
        gte: expirationThreshold,
      },
    },
    select: { id: true, name: true, email: true, enrollmentSecret: true },
  });

  if (!customer) {
    return NextResponse.json({ error: "Link expired or customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}
