import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
	if (!stripeInstance) {
		if (!process.env.STRIPE_SECRET_KEY) {
			console.error("STRIPE_SECRET_KEY environment variable is not set");
			console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('STRIPE')));
			throw new Error("STRIPE_SECRET_KEY is not set");
		}
		
		console.log("Initializing Stripe with key:", process.env.STRIPE_SECRET_KEY.substring(0, 12) + "...");
		
		stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
			typescript: true,
		});
	}
	
	return stripeInstance;
}

// Export a getter function instead of the instance
export const stripe = new Proxy({} as Stripe, {
	get(target, prop) {
		return getStripe()[prop as keyof Stripe];
	}
});

// Also export the getter function for explicit use
export { getStripe };
