// Test script to verify admin authentication
const { verifyAdminCredentials, getAdminCredentials } = require('./src/lib/admin-auth.ts');

console.log('Testing admin authentication...');

// This should initialize the credentials file
const credentials = getAdminCredentials();
console.log('Admin credentials initialized:', {
  username: credentials.username,
  hasPasswordHash: !!credentials.passwordHash,
  hasSalt: !!credentials.salt
});

// Test verification
const isValid = verifyAdminCredentials('admin', 'admin123');
console.log('Verification result for admin/admin123:', isValid);

const isInvalid = verifyAdminCredentials('admin', 'wrongpassword');
console.log('Verification result for admin/wrongpassword:', isInvalid);