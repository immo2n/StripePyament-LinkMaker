import { getStripe } from "@/lib/clients/stripe/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { customerId, email } = await req.json();

  if (!customerId || customerId.length == 0 || !email) {
    return new Response(JSON.stringify({ error: "Invalid customer id!" }), {
      status: 400,
    });
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });
    if (!existingCustomer) {
      return new Response(
        JSON.stringify({ error: "Customer does not exists!" }),
        {
          status: 400,
        }
      );
    }

    const stripe = getStripe();
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (setupIntent.client_secret) {
      await prisma.customer.update({
        where: { email },
        data: {
          enrollmentSecret: setupIntent.client_secret,
        },
      });
    }
    else {
        return new Response(
        JSON.stringify({ error: "Failed to make enrollment intent!" }),
        {
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: true,
        link: "https://google.com",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
