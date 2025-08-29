import { NextRequest, NextResponse } from 'next/server';
import { getPaymentLinks, addPaymentLink, deletePaymentLink, PaymentLink } from '@/lib/payment-links';
import { getBaseUrl } from '@/lib/config';

// GET - Fetch all payment links
export async function GET() {
	try {
		const links = getPaymentLinks();
		return NextResponse.json(links);
	} catch (error) {
		console.error('Error fetching payment links:', error);
		return NextResponse.json({ error: 'Failed to fetch payment links' }, { status: 500 });
	}
}

// POST - Create a new payment link
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { service, reason, amount, clientName, clientEmail } = body;

		// Validate required fields
		if (!service || !reason || !amount) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Generate unique ID
		const id = Math.random().toString(36).substring(2, 11);
		const baseUrl = getBaseUrl(request);
		const link = `${baseUrl}/checkout/${id}`;

		const newPaymentLink: PaymentLink = {
			id,
			service,
			reason,
			amount: parseFloat(amount),
			clientName: clientName || "—",
			clientEmail: clientEmail || "—",
			createdAt: new Date().toLocaleDateString(),
			link
		};

		addPaymentLink(newPaymentLink);

		return NextResponse.json(newPaymentLink, { status: 201 });
	} catch (error) {
		console.error('Error creating payment link:', error);
		return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
	}
}

// DELETE - Delete a payment link
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'Payment link ID is required' }, { status: 400 });
		}

		deletePaymentLink(id);

		return NextResponse.json({ message: 'Payment link deleted successfully' });
	} catch (error) {
		console.error('Error deleting payment link:', error);
		return NextResponse.json({ error: 'Failed to delete payment link' }, { status: 500 });
	}
}