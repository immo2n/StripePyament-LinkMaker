import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Complete your payment",
	description: "Secure checkout for your payment",
};

interface CheckoutPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function SecureCheckoutPage({
	params,
}: CheckoutPageProps) {
	const { id } = await params;
	
	// Pass the ID to the client component
	return <ClientCheckoutPage id={id} />;
}

// Import the client component
import ClientCheckoutPage from './client-page';