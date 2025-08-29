import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
	try {
		const healthCheck = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV || 'development',
			version: process.env.npm_package_version || '1.0.0',
		};

		return NextResponse.json({
			...healthCheck,
			status: 'healthy'
		}, {
			status: 200
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