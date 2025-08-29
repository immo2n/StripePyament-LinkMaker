"use client";

import React, { useState, useEffect } from "react";
import { StripeCheckoutForm } from "@/features/billing/components/checkout-form";
import { CreditCard, Shield, Lock } from "@phosphor-icons/react";
import Image from "next/image";

// Fetch payment link data from API
async function getPaymentLinkData(id: string) {
	try {
		const response = await fetch(`/api/payment-links/${id}`);
		if (!response.ok) {
			return null;
		}
		return await response.json();
	} catch (error) {
		console.error('Error fetching payment link:', error);
		return null;
	}
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

function PaymentSummary({ paymentData }: { paymentData: any }) {
	const hasClientInfo = paymentData.clientName !== "—" || paymentData.clientEmail !== "—";
	
	return (
		<div className='sticky top-0 p-8 lg:p-12 h-screen overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'>
			<div className='max-w-xl mx-auto'>
				{/* Logo */}
				<div className="mb-8 text-center">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20"></div>
						<div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
							<Image
								src="/abc.png"
								alt="Logo"
								width={150}
								height={50}
								className="h-12 w-auto mx-auto"
							/>
						</div>
					</div>
				</div>

				<div className='bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8'>
					<div className='flex items-center gap-3 mb-8'>
						<CreditCard className='w-8 h-8 text-blue-600' weight='duotone' />
						<div>
							<h3 className='text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
								Payment Details
							</h3>
							<p className="text-sm text-gray-500">Secure checkout summary</p>
						</div>
					</div>

					{/* Client Info - Only show if client info exists */}
					{hasClientInfo && (
						<div className="mb-8 pb-6 border-b border-gray-100">
							<h4 className="font-bold text-gray-900 mb-3 flex items-center">
								<span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
								Bill To:
							</h4>
							<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
								{paymentData.clientName !== "—" && (
									<p className="font-semibold text-gray-900">{paymentData.clientName}</p>
								)}
								{paymentData.clientEmail !== "—" && (
									<p className="text-gray-600">{paymentData.clientEmail}</p>
								)}
							</div>
						</div>
					)}

					{/* Service & Reason */}
					<div className="mb-8 pb-6 border-b border-gray-100">
						{paymentData.service && (
							<div className="mb-6">
								<h4 className="font-bold text-gray-900 mb-3 flex items-center">
									<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
									Service
								</h4>
								<p className="text-gray-700 font-medium">{paymentData.service}</p>
							</div>
						)}
						{paymentData.reason && (
							<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
								<h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
									<span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
									Payment Details:
								</h5>
								<p className="text-sm text-blue-800 leading-relaxed">{paymentData.reason}</p>
							</div>
						)}
					</div>

					<div className='mb-8 pb-6 border-b border-gray-100'>
						<div className='flex items-baseline gap-3 mb-3'>
							<span className='text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
								${paymentData.amount.toFixed(2)}
							</span>
							<span className='text-xl text-gray-500 font-medium'>USD</span>
						</div>
						<div className="flex items-center">
							<span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
							<p className='text-sm text-gray-600 font-medium'>One-time payment</p>
						</div>
					</div>

					<div className="space-y-4 text-sm">
						<div className="flex justify-between items-center py-2">
							<span className="text-gray-600 font-medium">Subtotal</span>
							<span className="text-gray-900 font-semibold">${paymentData.amount.toFixed(2)}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="text-gray-600 font-medium">Processing Fee</span>
							<span className="text-green-600 font-semibold">$0.00</span>
						</div>
						<div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-t-2 border-blue-200">
							<span className="text-gray-900 font-bold text-lg">Total</span>
							<span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								${paymentData.amount.toFixed(2)}
							</span>
						</div>
					</div>
				</div>

				<SecureCheckoutInfo />
			</div>
		</div>
	);
}

export default function ClientCheckoutPage({ id }: { id: string }) {
	const [paymentData, setPaymentData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPaymentData = async () => {
			const data = await getPaymentLinkData(id);
			if (!data) {
				// Redirect to 404 or error page if payment link not found
				window.location.href = '/404';
				return;
			}
			setPaymentData(data);
			setLoading(false);
		};

		fetchPaymentData();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading payment details...</p>
				</div>
			</div>
		);
	}

	if (!paymentData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Link Not Found</h1>
					<p className="text-gray-600">This payment link is invalid or has expired.</p>
				</div>
			</div>
		);
	}

	const hasClientName = paymentData.clientName && paymentData.clientName !== "—";

	return (
		<main className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col lg:flex-row'>
			{/* Left Side - Form */}
			<div className='w-full lg:w-[45%] p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-white to-gray-50'>
				<div className='max-w-md mx-auto'>
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center justify-center mb-6 lg:hidden">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-lg opacity-20"></div>
								<div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
									<Image
										src="/abc.png"
										alt="Logo"
										width={150}
										height={50}
										className="h-10 w-auto"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className='mb-8'>
						<h1 className='text-3xl lg:text-4xl font-black tracking-tight mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
							Complete your payment
						</h1>
						<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
							<p className='text-gray-700 leading-relaxed text-center'>
								{hasClientName ? (
									<>
										Hello <span className="font-bold text-blue-600">{paymentData.clientName}</span>, you're about to pay{' '}
									</>
								) : (
									<>You're about to pay{' '}</>
								)}
								<span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
									${paymentData.amount.toFixed(2)} USD
								</span>
							</p>
						</div>
					</div>

					{/* Mobile Payment Summary */}
					<div className="lg:hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
						<h3 className="font-bold text-gray-900 mb-4 flex items-center">
							<span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
							Payment Summary
						</h3>
						<div className="space-y-4">
							{paymentData.service && (
								<div>
									<h4 className="font-semibold text-gray-900 mb-1 text-sm">Service</h4>
									<p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">{paymentData.service}</p>
								</div>
							)}
							{paymentData.reason && (
								<div>
									<h5 className="font-semibold text-gray-900 mb-1 text-sm">Details:</h5>
									<p className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2 leading-relaxed">{paymentData.reason}</p>
								</div>
							)}
							<div className="flex justify-between items-center pt-4 border-t border-gray-200">
								<span className="text-gray-600 font-medium">Total Amount</span>
								<span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									${paymentData.amount.toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
						<StripeCheckoutForm amount={paymentData.amount} paymentLinkId={id} />
					</div>

					<div className="mt-6 text-center">
						<p className='text-xs text-gray-500 leading-relaxed bg-white/60 rounded-lg p-3'>
							🔒 By proceeding, you agree to our Terms of Service and authorize us
							to charge your card for this payment. Your payment information is secure and encrypted.
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Summary */}
			<div className='w-full hidden lg:block lg:w-[55%]'>
				<PaymentSummary paymentData={paymentData} />
			</div>
		</main>
	);
}