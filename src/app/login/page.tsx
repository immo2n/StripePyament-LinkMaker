"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import Image from "next/image";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// Set authentication token
				localStorage.setItem('adminAuth', 'true');
				router.push('/admin');
			} else {
				setError(data.error || "Invalid username or password");
			}
		} catch (error) {
			console.error('Login error:', error);
			setError("Login failed. Please try again.");
		}
		
		setLoading(false);
	};

	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
			<div className="max-w-md w-full mx-4">
				{/* Logo */}
				<div className="text-center mb-8">
					<Image
						src="/abc.png"
						alt="Logo"
						width={180}
						height={60}
						className="h-12 w-auto mx-auto mb-4"
					/>
					<h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
					<p className="text-gray-600 mt-2">Sign in to access the payment dashboard</p>
				</div>

				{/* Login Form */}
				<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
					<form onSubmit={handleLogin} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Username
							</label>
							<Input
								type="text"
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="h-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
								>
									{showPassword ? (
										<EyeSlash className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<p className="text-sm text-red-800">{error}</p>
							</div>
						)}

						<Button
							type="submit"
							disabled={loading || !username || !password}
							className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50"
						>
							{loading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Signing in...
								</div>
							) : (
								<>
									<Lock className="w-5 h-5 mr-2" />
									Sign In
								</>
							)}
						</Button>
					</form>


				</div>

				{/* Security Notice */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Your session is secured with encryption • Change default credentials in production
					</p>
				</div>
			</div>
		</div>
	);
}