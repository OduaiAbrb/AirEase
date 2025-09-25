// Email service for sending price alerts

// Mock email service for demo purposes
export async function sendPriceAlert(watchData, flightData) {
  try {
    console.log('🎯 PRICE ALERT EMAIL SENT!')
    console.log('To:', watchData.email || 'user@example.com')
    console.log('Subject: ✈️ Flight Price Alert - Your Target Price Hit!')
    
    const emailContent = generateEmailContent(watchData, flightData)
    console.log('Email Content:', emailContent)
    
    // In a real implementation, this would use Email.js or nodemailer
    // For demo purposes, we'll simulate email sending
    
    // Simulate email.js sending
    const mockEmailResponse = {
      status: 200,
      text: 'Email sent successfully via Email.js'
    }
    
    return {
      success: true,
      message: 'Price alert email sent successfully',
      emailId: `email_${Date.now()}`,
      content: emailContent
    }
    
  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

function generateEmailContent(watchData, flightData) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Flight Price Alert</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .flight-card { border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f0fdf4; }
        .price-highlight { font-size: 32px; color: #10b981; font-weight: bold; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #2563eb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
        .flight-details { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
        .route { font-size: 18px; font-weight: bold; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Price Alert: Your Target Hit!</h1>
          <p>Great news! The flight you're watching has dropped to your target price.</p>
        </div>
        
        <div class="content">
          <div class="flight-card">
            <div class="flight-details">
              <div>
                <div class="route">${flightData.from} → ${flightData.to}</div>
                <div>${flightData.airline} ${flightData.flightNumber}</div>
                <div>Departure: ${flightData.departureTime}</div>
                <div>Duration: ${flightData.duration}</div>
              </div>
              <div style="text-align: right;">
                <div class="price-highlight">$${flightData.price}</div>
                <div style="text-decoration: line-through; color: #64748b;">Target: $${watchData.targetPrice}</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://airease.preview.emergentagent.com/book/${flightData.id}" class="cta-button">
                📱 Book Now
              </a>
              <a href="https://airease.preview.emergentagent.com/watchlist" class="cta-button" style="background: linear-gradient(135deg, #64748b, #475569);">
                👀 View All Watches
              </a>
            </div>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎒 Packing Suggestions</h3>
            <p>Based on your destination weather:</p>
            <ul>
              <li>Light jacket for ${flightData.to} weather</li>
              <li>Comfortable walking shoes</li>
              <li>Travel adapter for electronics</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
            <h3>⏰ Leave-by Time Calculation</h3>
            <p><strong>Recommended departure from home:</strong> 3 hours before flight</p>
            <p>This includes travel time, check-in, security, and boarding.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Brought to you by Airease - Never miss a flight deal again!</p>
          <p>You can manage your price alerts at any time in your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return {
    subject: `✈️ Price Alert: ${flightData.from} → ${flightData.to} now $${flightData.price}!`,
    html: emailHTML,
    text: `Flight Price Alert! Your watched flight ${flightData.from} → ${flightData.to} (${flightData.airline} ${flightData.flightNumber}) is now $${flightData.price}, hitting your target of $${watchData.targetPrice}. Book now: https://airease.preview.emergentagent.com/book/${flightData.id}`
  }
}

// Email.js integration for frontend use
export function initEmailJS() {
  // This would initialize Email.js in a real implementation
  console.log('📧 Email.js initialized for client-side email sending')
}

export async function sendClientEmail(templateParams) {
  try {
    // Mock Email.js send
    console.log('Sending email via Email.js with params:', templateParams)
    
    // In real implementation:
    // const result = await emailjs.send(
    //   process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    //   process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, 
    //   templateParams,
    //   process.env.NEXT_PUBLIC_EMAILJS_USER_ID
    // )
    
    return {
      success: true,
      message: 'Email sent via Email.js'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}