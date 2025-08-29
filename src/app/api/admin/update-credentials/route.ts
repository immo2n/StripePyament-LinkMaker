import { NextRequest, NextResponse } from 'next/server';
import { updateAdminCredentials } from '@/lib/admin-auth';
import { z } from 'zod';

const updateCredentialsSchema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters long'),
	password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = updateCredentialsSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: result.error.issues },
				{ status: 400 }
			);
		}

		const { username, password } = result.data;

		// Update credentials
		updateAdminCredentials(username, password);

		return NextResponse.json({ 
			success: true,
			message: 'Credentials updated successfully'
		});

	} catch (error) {
		console.error('Error updating credentials:', error);
		return NextResponse.json(
			{ error: 'Failed to update credentials' },
			{ status: 500 }
		);
	}
}