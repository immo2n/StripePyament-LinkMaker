import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'payment-links.json');

export interface PaymentLink {
	id: string;
	service: string;
	reason: string;
	amount: number;
	clientName: string;
	clientEmail: string;
	createdAt: string;
	link: string;
	paymentIntentId?: string;
	paymentIntentClientSecret?: string;
}

// Ensure data directory exists
function ensureDataDirectory() {
	const dataDir = path.dirname(DATA_FILE);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

// Read payment links from JSON file
export function getPaymentLinks(): PaymentLink[] {
	try {
		ensureDataDirectory();
		if (!fs.existsSync(DATA_FILE)) {
			return [];
		}
		const data = fs.readFileSync(DATA_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading payment links:', error);
		return [];
	}
}

// Save payment links to JSON file
export function savePaymentLinks(links: PaymentLink[]): void {
	try {
		ensureDataDirectory();
		fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
	} catch (error) {
		console.error('Error saving payment links:', error);
		throw new Error('Failed to save payment links');
	}
}

// Get a single payment link by ID
export function getPaymentLinkById(id: string): PaymentLink | null {
	const links = getPaymentLinks();
	return links.find(link => link.id === id) || null;
}

// Add a new payment link
export function addPaymentLink(link: PaymentLink): void {
	const links = getPaymentLinks();
	links.push(link);
	savePaymentLinks(links);
}

// Delete a payment link
export function deletePaymentLink(id: string): void {
	const links = getPaymentLinks();
	const filteredLinks = links.filter(link => link.id !== id);
	savePaymentLinks(filteredLinks);
}

// Update a payment link with PaymentIntent information
export function updatePaymentLinkWithIntent(
	id: string, 
	paymentIntentId: string, 
	clientSecret: string
): void {
	const links = getPaymentLinks();
	const linkIndex = links.findIndex(link => link.id === id);
	
	if (linkIndex !== -1) {
		links[linkIndex].paymentIntentId = paymentIntentId;
		links[linkIndex].paymentIntentClientSecret = clientSecret;
		savePaymentLinks(links);
	}
}