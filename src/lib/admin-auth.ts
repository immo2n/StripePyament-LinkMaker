import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ADMIN_FILE = path.join(process.cwd(), 'data', 'admin-credentials.json');

export interface AdminCredentials {
	username: string;
	passwordHash: string;
	salt: string;
	lastUpdated: string;
}

// Default admin credentials
const DEFAULT_CREDENTIALS = {
	username: 'admin',
	password: 'admin123'
};

// Ensure data directory exists
function ensureDataDirectory() {
	const dataDir = path.dirname(ADMIN_FILE);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

// Hash password with salt
function hashPassword(password: string, salt: string): string {
	return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generate salt
function generateSalt(): string {
	return crypto.randomBytes(32).toString('hex');
}

// Initialize admin credentials file if it doesn't exist
function initializeAdminCredentials(): void {
	ensureDataDirectory();

	if (!fs.existsSync(ADMIN_FILE)) {
		const salt = generateSalt();
		const passwordHash = hashPassword(DEFAULT_CREDENTIALS.password, salt);

		const credentials: AdminCredentials = {
			username: DEFAULT_CREDENTIALS.username,
			passwordHash,
			salt,
			lastUpdated: new Date().toISOString()
		};

		fs.writeFileSync(ADMIN_FILE, JSON.stringify(credentials, null, 2));
	}
}

// Get admin credentials
export function getAdminCredentials(): AdminCredentials {
	try {
		initializeAdminCredentials();
		const data = fs.readFileSync(ADMIN_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error reading admin credentials:', error);
		// Return default if file is corrupted
		const salt = generateSalt();
		const passwordHash = hashPassword(DEFAULT_CREDENTIALS.password, salt);
		return {
			username: DEFAULT_CREDENTIALS.username,
			passwordHash,
			salt,
			lastUpdated: new Date().toISOString()
		};
	}
}

// Verify admin credentials
export function verifyAdminCredentials(username: string, password: string): boolean {
	try {
		const credentials = getAdminCredentials();

		if (username !== credentials.username) {
			return false;
		}

		const hashedPassword = hashPassword(password, credentials.salt);
		return hashedPassword === credentials.passwordHash;
	} catch (error) {
		console.error('Error verifying admin credentials:', error);
		return false;
	}
}

// Update admin credentials
export function updateAdminCredentials(newUsername: string, newPassword: string): void {
	try {
		ensureDataDirectory();

		const salt = generateSalt();
		const passwordHash = hashPassword(newPassword, salt);

		const credentials: AdminCredentials = {
			username: newUsername,
			passwordHash,
			salt,
			lastUpdated: new Date().toISOString()
		};

		fs.writeFileSync(ADMIN_FILE, JSON.stringify(credentials, null, 2));
	} catch (error) {
		console.error('Error updating admin credentials:', error);
		throw new Error('Failed to update admin credentials');
	}
}