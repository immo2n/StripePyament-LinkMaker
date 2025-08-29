import { NextRequest, NextResponse } from 'next/server';
import { getPaymentLinkById } from '@/lib/payment-links';

// GET - Fetch a single payment link by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const link = getPaymentLinkById(id);

		if (!link) {
			return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
		}

		return NextResponse.json(link);
	} catch (error) {
		console.error('Error fetching payment link:', error);
		return NextResponse.json({ error: 'Failed to fetch payment link' }, { status: 500 });
	}
}