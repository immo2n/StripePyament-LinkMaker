import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
	try {
		// Check if the application is healthy
		const healthCheck = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || 'development',
			version: process.env.npm_package_version || '1.0.0',
		};

		// Check if data directory is accessible
		const dataDir = path.join(process.cwd(), 'data');
		const dataAccessible = fs.existsSync(dataDir);

		// Check if admin credentials file exists
		const adminFile = path.join(dataDir, 'admin-credentials.json');
		const adminFileExists = fs.existsSync(adminFile);

		// Check if payment links file exists
		const paymentLinksFile = path.join(dataDir, 'payment-links.json');
		const paymentLinksFileExists = fs.existsSync(paymentLinksFile);

		const systemChecks = {
			dataDirectory: dataAccessible,
			adminCredentials: adminFileExists,
			paymentLinksStorage: paymentLinksFileExists,
		};

		// Determine overall health
		const allChecksPass = Object.values(systemChecks).every(check => check === true);
		
		return NextResponse.json({
			...healthCheck,
			status: allChecksPass ? 'healthy' : 'degraded',
			checks: systemChecks,
		}, {
			status: allChecksPass ? 200 : 503
		});

	} catch (error) {
		console.error('Health check failed:', error);
		
		return NextResponse.json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error',
		}, {
			status: 503
		});
	}
}