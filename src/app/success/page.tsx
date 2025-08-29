"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, X } from "@phosphor-icons/react";
import Image from "next/image";

function SuccessPageContent() {
	const [paymentDetails, setPaymentDetails] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const searchParams = useSearchParams();

	useEffect(() => {
		const redirectStatus = searchParams.get('redirect_status');
		const paymentIntent = searchParams.get('payment_intent');
		const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

		if (redirectStatus === 'succeeded' && paymentIntent) {
			setPaymentDetails({
				status: 'succeeded',
				paymentIntent,
				paymentIntentClientSecret
			});
		} else if (redirectStatus === 'failed') {
			setPaymentDetails({
				status: 'failed'
			});
		} else {
			setPaymentDetails({
				status: 'unknown'
			});
		}
		
		setLoading(false);
	}, [searchParams]);

	const handleCloseWindow = () => {
		// Try multiple methods to close the window/tab
		try {
			// Method 1: If window was opened by JavaScript (popup/new window)
			if (window.opener) {
				window.close();
				return;
			}

			// Method 2: Try to close the current tab
			window.close();

			// Method 3: If close() doesn't work, try alternative methods
			setTimeout(() => {
				// Check if window is still open after attempting to close
				try {
					if (!window.closed) {
						// Try to navigate to about:blank
						window.location.href = 'about:blank';
					}
				} catch (e) {
					// If all else fails, show a message
					document.body.innerHTML = `
						<div style="
							display: flex; 
							justify-content: center; 
							align-items: center; 
							height: 100vh; 
							font-family: system-ui, -apple-system, sans-serif;
							background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
						">
							<div style="
								text-align: center; 
								padding: 2rem; 
								background: white; 
								border-radius: 1rem; 
								box-shadow: 0 10px 25px rgba(0,0,0,0.1);
								max-width: 400px;
							">
								<div style="
									width: 60px; 
									height: 60px; 
									background: #10b981; 
									border-radius: 50%; 
									display: flex; 
									align-items: center; 
									justify-content: center; 
									margin: 0 auto 1rem;
									color: white;
									font-size: 24px;
								">✓</div>
								<h2 style="color: #065f46; margin-bottom: 1rem;">Payment Complete!</h2>
								<p style="color: #6b7280; margin-bottom: 1.5rem;">
									Your payment has been processed successfully.<br/>
									You can now safely close this tab.
								</p>
								<p style="color: #9ca3af; font-size: 0.875rem;">
									Press Ctrl+W (Windows) or Cmd+W (Mac) to close this tab
								</p>
							</div>
						</div>
					`;
				}
			}, 100);

		} catch (error) {
			console.log('Could not close window automatically');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Processing your payment...</p>
				</div>
			</div>
		);
	}

	if (paymentDetails?.status === 'succeeded') {
		return (
			<div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-50">
				{/* Header */}
				<div className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center justify-center flex-1">
								<Image
									src="/abc.png"
									alt="Logo"
									width={180}
									height={60}
									className="h-12 w-auto"
								/>
							</div>
							<button
								onClick={handleCloseWindow}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
								title="Close window"
							>
								<X className="w-6 h-6" />
							</button>
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
								
								{paymentDetails.paymentIntent && (
									<div className="bg-emerald-50 rounded-lg p-4 mb-6">
										<p className="text-emerald-800 font-medium text-sm">
											Transaction ID: {paymentDetails.paymentIntent}
										</p>
										<p className="text-emerald-700 text-sm mt-1">
											Please save this ID for your records
										</p>
									</div>
								)}

								<div className="bg-gray-50 rounded-lg p-4 mb-6">
									<p className="text-gray-700 text-sm">
										🔒 Your payment was processed securely<br/>
										📧 You will receive a confirmation email shortly<br/>
										📞 Contact us if you have any questions
									</p>
								</div>
							</div>

							<div className="space-y-3">
								<button
									onClick={handleCloseWindow}
									className="w-full h-12 text-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium transition-all duration-200"
								>
									Close Window
								</button>
								
								<p className="text-xs text-gray-500">
									You can safely close this window now
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (paymentDetails?.status === 'failed') {
		return (
			<div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-pink-50">
				{/* Header */}
				<div className="bg-white shadow-sm border-b">
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center justify-center flex-1">
								<Image
									src="/abc.png"
									alt="Logo"
									width={180}
									height={60}
									className="h-12 w-auto"
								/>
							</div>
							<button
								onClick={handleCloseWindow}
								className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
								title="Close window"
							>
								<X className="w-6 h-6" />
							</button>
						</div>
					</div>
				</div>

				{/* Failed Content */}
				<div className="py-20 px-4">
					<div className="mx-auto max-w-lg text-center">
						<div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
							<div className="mb-8">
								<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
									<X className="w-12 h-12 text-red-600" weight="fill" />
								</div>
								<h1 className="text-3xl font-bold mb-4 text-gray-900">
									Payment Failed
								</h1>
								<p className="text-lg text-gray-600 mb-6">
									Unfortunately, your payment could not be processed. Please try again or contact support.
								</p>
								
								<div className="bg-red-50 rounded-lg p-4 mb-6">
									<p className="text-red-800 font-medium text-sm">
										No charges were made to your account
									</p>
								</div>
							</div>

							<button
								onClick={handleCloseWindow}
								className="w-full h-12 text-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-200"
							>
								Close Window
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Unknown status
	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Link</h1>
				<p className="text-gray-600 mb-4">This payment link is invalid or has expired.</p>
				<button
					onClick={handleCloseWindow}
					className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
				>
					Close Window
				</button>
			</div>
		</div>
	);
}

export default function SuccessPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		}>
			<SuccessPageContent />
		</Suspense>
	);
}