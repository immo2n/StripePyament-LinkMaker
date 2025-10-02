// Test script for the email API
// Run with: node test-email-api.js

const emailApiUrl = "http://16.170.237.184:3001/unipile/google/send-mail";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZwZHZxdG0wMDAwcGFhMXMyZm1kaXMyIiwiZW1haWwiOiJuYW1lMDE5ODA4MEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1OTI0MjM1NywiZXhwIjoxODA3MTk0MzU3fQ.kQDqcnt2V5xRDD4q6RkCiWabg1Mi6NVcXUQCI1eq6fc";

const testEmailPayload = {
  to: ["moon.work247@gmail.com"], // Replace with your test email
  subject: "Test Email - Credit Card Info System",
  body: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        Test Email - Credit Card Information System
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Test Payment Details</h3>
        <p><strong>Payment Link ID:</strong> TEST-12345</p>
        <p><strong>Amount:</strong> $150.00</p>
        <p><strong>Client Name:</strong> Test Customer</p>
        <p><strong>Client Email:</strong> test@example.com</p>
      </div>

      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ Test Credit Card Information</h3>
        <p><strong>Cardholder Name:</strong> Test User</p>
        <p><strong>Cardholder Email:</strong> test@example.com</p>
        <p><strong>Card Number:</strong> **** **** **** 4242</p>
        <p><strong>Expiry Date:</strong> 12/25</p>
        <p><strong>Card Brand:</strong> visa</p>
        <p><strong>CVV:</strong> ***</p>
      </div>

      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #0c5460; font-size: 14px;">
          <strong>Note:</strong> This is a test email to verify the email API integration is working correctly.
        </p>
      </div>
    </div>
  `,
  isHtml: true,
};

async function testEmailAPI() {
  try {
    console.log("Testing email API...");
    console.log("API URL:", emailApiUrl);

    const response = await fetch(emailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testEmailPayload),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const result = await response.text();
      console.log("✅ Email sent successfully!");
      console.log("Response:", result);
    } else {
      const errorText = await response.text();
      console.log("❌ Email failed to send");
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
}

// Run the test
testEmailAPI();
