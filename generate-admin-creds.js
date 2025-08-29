const crypto = require('crypto');
const fs = require('fs');

// Generate salt and hash for 'admin123'
const salt = crypto.randomBytes(32).toString('hex');
const passwordHash = crypto.pbkdf2Sync('admin123', salt, 10000, 64, 'sha512').toString('hex');

const credentials = {
  username: 'admin',
  passwordHash: passwordHash,
  salt: salt,
  lastUpdated: new Date().toISOString()
};

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data', { recursive: true });
}

fs.writeFileSync('data/admin-credentials.json', JSON.stringify(credentials, null, 2));
console.log('Admin credentials file created successfully');
console.log('Username: admin');
console.log('Password: admin123');