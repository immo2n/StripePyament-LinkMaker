import { StripeCheckoutForm } from "@/features/billing/components/checkout-form";
import { Metadata } from "next";
import { ArrowLeft, CreditCard, Shield, Lock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Complete your payment",
	description: "Secure checkout for your custom payment",
};

interface CheckoutPageProps {
	searchParams: Promise<{
		amount: string;
		service: string;
		reason: string;
	}>;
}

function SecureCheckoutInfo() {
	return (
		<div className="space-y-6">
			<div>
				<h4 className='font-semibold mb-4 text-gray-900 flex items-center'>
					<Shield className="w-5 h-5 mr-2 text-blue-600" />
					Secure Checkout
				</h4>
				<p className='text-sm text-gray-600 leading-relaxed'>
					Your payment is secured by industry-leading encryption and security
					measures. We never store your complete card details.
				</p>
			</div>
			
			<div className="bg-blue-50 rounded-lg p-4">
				<div className="flex items-center mb-2">
					<Lock className="w-4 h-4 text-blue-600 mr-2" />
					<span className="text-sm font-medium text-blue-900">SSL Encrypted</span>
				</div>
				<p className="text-xs text-blue-700">
					Your data is protected with 256-bit SSL encryption
				</p>
			</div>

			<div className="space-y-3">
				<h5 className="font-medium text-gray-900">Accepted Payment Methods</h5>
				<div className="flex space-x-2">
					<div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">VISA</div>
					<div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">Mastercard</div>
					<div className="bg-gray-100 rounded px-2 py-1 text-xs font-medium">AMEX</div>
				</div>
			</div>
		</div>
	);
}

function PaymentSummary({ amount, service, reason }: { amount: number; service: string; reason: string }) {
	return (
		<div className='sticky top-0 p-8 lg:p-12 h-screen overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50'>
			<div className='max-w-xl mx-auto'>
				{/* Logo */}
				<div className="mb-8 text-center">
					<Image
						src="/abc.png"
						alt="Logo"
						width={150}
						height={50}
						className="h-10 w-auto mx-auto"
					/>
				</div>

				<div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
					<div className='flex items-center gap-3 mb-6'>
						<CreditCard className='w-6 h-6 text-blue-600' weight='duotone' />
						<h3 className='text-xl font-semibold text-gray-900'>Payment Summary</h3>
					</div>

					{/* Service & Reason */}
					<div className="mb-6 pb-6 border-b border-gray-100">
						{service && (
							<div className="mb-4">
								<h4 className="font-semibold text-gray-900 mb-1">Service</h4>
								<p className="text-sm text-gray-600">{service}</p>
							</div>
						)}
						{reason && (
							<div className="bg-blue-50 rounded-lg p-3">
								<h5 className="text-sm font-medium text-blue-900 mb-2">Payment Reason:</h5>
								<p className="text-xs text-blue-800">{reason}</p>
							</div>
						)}
					</div>

					<div className='mb-6 pb-6 border-b border-gray-100'>
						<div className='flex items-baseline gap-2 mb-2'>
							<span className='text-4xl font-bold text-gray-900'>
								${amount.toFixed(2)}
							</span>
							<span className='text-lg text-gray-500'>USD</span>
						</div>
						<p className='text-sm text-gray-600'>
							One-time payment
						</p>
					</div>

					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">Subtotal</span>
							<span className="text-gray-900">${amount.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Processing Fee</span>
							<span className="text-gray-900">$0.00</span>
						</div>
						<div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100">
							<span className="text-gray-900">Total</span>
							<span className="text-gray-900">${amount.toFixed(2)}</span>
						</div>
					</div>
				</div>

				<SecureCheckoutInfo />
			</div>
		</div>
	);
}

export default async function CheckoutPage({
	searchParams,
}: CheckoutPageProps) {
	const { amount: amountStr, service = '', reason = '' } = await searchParams;
	const amount = parseFloat(amountStr);

	if (!amount || amount <= 0) {
		redirect('/');
	}

	return (
		<main className='min-h-screen bg-white flex flex-col lg:flex-row'>
			{/* Left Side - Form */}
			<div className='w-full lg:w-[45%] p-6 lg:p-8 overflow-y-auto bg-white'>
				<div className='max-w-md mx-auto'>
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-center mb-6 lg:hidden">
							<Image
								src="/abc.png"
								alt="Logo"
								width={150}
								height={50}
								className="h-10 w-auto"
							/>
						</div>
						
						<Link
							href='/'
							className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6'>
							<ArrowLeft className='w-4 h-4 mr-2' aria-hidden='true' />
							Back to home
						</Link>
					</div>

					<div className='mb-8'>
						<h1 className='text-2xl lg:text-3xl font-bold tracking-tight mb-2 text-gray-900'>
							Complete your payment
						</h1>
						<p className='text-gray-600'>
							You're about to pay <span className="font-semibold">${amount.toFixed(2)} USD</span>
						</p>
					</div>

					{/* Mobile Payment Summary */}
					<div className="lg:hidden bg-gray-50 rounded-lg p-4 mb-6">
						{(service || reason) && (
							<div className="mb-3">
								{service && (
									<div className="mb-2">
										<h4 className="font-medium text-gray-900 mb-1">Service</h4>
										<p className="text-sm text-gray-600">{service}</p>
									</div>
								)}
								{reason && (
									<div className="mb-2">
										<h5 className="text-sm font-medium text-gray-700">Reason:</h5>
										<p className="text-xs text-gray-600">{reason}</p>
									</div>
								)}
							</div>
						)}
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Total Amount</span>
							<span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
						</div>
					</div>

					<StripeCheckoutForm amount={amount} />

					<p className='text-xs text-gray-500 mt-6 leading-relaxed'>
						By proceeding, you agree to our Terms of Service and authorize us
						to charge your card for this payment. Your payment information is secure and encrypted.
					</p>
				</div>
			</div>

			{/* Right Side - Summary */}
			<div className='w-full hidden lg:block lg:w-[55%]'>
				<PaymentSummary amount={amount} service={service} reason={reason} />
			</div>
		</main>
	);
}
