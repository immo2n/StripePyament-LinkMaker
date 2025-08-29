"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PaymentEnrollSavePage({ params }) {
  const { hash } = params;

  if (!hash || hash.trim() === "") {
    return <p className="p-8 text-red-600">Invalid enrollment link.</p>;
  }

  const customer = await prisma.customer.findFirst({
    where: {
      enrollmentLinkHash: hash,
      enrollHashTimestamp: {
        gte: new Date(Date.now() - 30 * 60 * 1000),
      },
    },
  });

  if (!customer) {
    return (
      <p className="p-8 text-red-600">
        Enrollment link expired or customer not found.
      </p>
    );
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { paymentEnrolled: true },
  });

  redirect("/customers/saved");
}