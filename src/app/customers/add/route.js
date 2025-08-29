import { getStripe } from "@/lib/clients/stripe/server";

export async function POST(req) {
  const { name, email } = await req.json();

  try {
    const stripe = getStripe();
    const customer = await stripe.customers.create({ name, email });

    if (!customer?.id || !customer.id.startsWith("cus_")) {
      return new Response(
        JSON.stringify({ error: "Invalid customer response from Stripe" }),
        { status: 400 }
      );
    }

    /**
     * {
  "id": "cus_Sx5cgYDDlThJEV",
  "object": "customer",
  "address": null,
  "balance": 0,
  "created": 1756409100,
  "currency": null,
  "default_source": null,
  "delinquent": false,
  "description": null,
  "discount": null,
  "email": "jennyrosen@example.com",
  "invoice_prefix": "PIBN8EL6",
  "invoice_settings": {
    "custom_fields": null,
    "default_payment_method": null,
    "footer": null,
    "rendering_options": null
  },
  "livemode": false,
  "metadata": {},
  "name": "Jenny Rosen",
  "next_invoice_sequence": 1,
  "phone": null,
  "preferred_locales": [],
  "shipping": null,
  "tax_exempt": "none",
  "test_clock": null
}
     * 
     */

    const dbCustomer = {
      customer_id: customer.id,
      name: customer.name || null,
      email: customer.email || null
    };

    console.log("DB-Ready Customer:", dbCustomer);


    
    return new Response(
      JSON.stringify({
        customer: dbCustomer,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
}
