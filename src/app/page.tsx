"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@phosphor-icons/react";
import Image from "next/image";

function HomePageContent() {
	const [showSuccess, setShowSuccess] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	

	// All hooks must be at the top level
	useEffect(() => {
		// Check if user was redirected back after successful payment
		const redirectStatus = searchParams.get('redirect_status');
		const paymentIntent = searchParams.get('payment_intent');

		if (redirectStatus === 'succeeded' && paymentIntent) {
			// Redirect to dedicated success page
			router.push(`/success?redirect_status=${redirectStatus}&payment_intent=${paymentIntent}&payment_intent_client_secret=${searchParams.get('payment_intent_client_secret') || ''}`);
		} else {
			// For direct visits to home page, redirect to admin
			router.push('/admin');
		}
	}, [searchParams, router]);

	const handleNewPayment = () => {
		setShowSuccess(false);
	};

	if (showSuccess) {
		return (
			<div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-50">
				{/* Header */}
				<div className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="flex items-center justify-center">
							<Image
								src="/abc.png"
								alt="Logo"
								width={180}
								height={60}
								className="h-12 w-auto"
							/>
						</div>
					</div>
				</div>

				{/* Success Content */}
				<div className="py-20 px-4">
					<div className="mx-auto max-w-lg text-center">
						<div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
							<div className="mb-8">
								<div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<CheckCircle
										className="w-12 h-12 text-emerald-600"
										weight="fill"
									/>
								</div>
								<h1 className="text-3xl font-bold mb-4 text-gray-900">
									Payment Successful!
								</h1>
								<p className="text-lg text-gray-600 mb-6">
									Your payment has been processed successfully. Thank you for your business!
								</p>
								<div className="bg-emerald-50 rounded-lg p-4 mb-6">
									<p className="text-emerald-800 font-medium">
										Transaction completed securely
									</p>
								</div>
							</div>

							<Button
								onClick={handleNewPayment}
								className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium"
							>
								Make Another Payment
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-gray-600">Redirecting to admin panel...</p>
			</div>
		</div>
	);
}

export default function HomePage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		}>
			<HomePageContent />
		</Suspense>
	);
}