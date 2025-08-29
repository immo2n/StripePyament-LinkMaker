import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/admin-auth';
import { z } from 'zod';

const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = loginSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: 'Invalid request', details: result.error.issues },
				{ status: 400 }
			);
		}

		const { username, password } = result.data;

		console.log('Login attempt:', { username, password: '***' });

		// Verify credentials
		const isValid = verifyAdminCredentials(username, password);
		
		console.log('Verification result:', isValid);

		if (!isValid) {
			return NextResponse.json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			);
		}

		// In a real app, you'd generate a JWT token here
		// For simplicity, we'll just return success
		return NextResponse.json({ 
			success: true,
			message: 'Login successful'
		});

	} catch (error) {
		console.error('Error during login:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}