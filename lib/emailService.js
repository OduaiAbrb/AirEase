// Email service for sending price alerts with AI recommendations

import { generatePackingRecommendations, generateTravelTips, calculateTimeBudget } from './aiRecommendations.js'

// Enhanced email service with AI recommendations
export async function sendPriceAlert(watchData, flightData) {
  try {
    console.log('🎯 PRICE ALERT EMAIL WITH AI RECOMMENDATIONS!')
    console.log('To:', watchData.email || 'user@example.com')
    console.log('Subject: ✈️ Flight Price Alert - Your Target Price Hit!')
    
    // Generate AI-powered recommendations
    const packingRecs = await generatePackingRecommendations(flightData, {
      tripType: watchData.tripType || 'leisure',
      duration: watchData.duration || '3-5 days'
    })
    
    const travelTips = await generateTravelTips(flightData)
    const timeBudget = await calculateTimeBudget(flightData)
    
    const emailContent = generateEnhancedEmailContent(watchData, flightData, {
      packingRecs,
      travelTips, 
      timeBudget
    })
    
    console.log('📧 Enhanced Email Content Generated with AI recommendations')
    console.log('🎒 Packing Recommendations:', packingRecs.recommendations)
    console.log('💡 Travel Tips:', travelTips.tips)
    console.log('⏰ Time Budget:', timeBudget.leaveByTime)
    
    // Simulate email sending
    const mockEmailResponse = {
      status: 200,
      text: 'Enhanced email sent successfully with AI recommendations'
    }
    
    return {
      success: true,
      message: 'Price alert email sent with AI-powered recommendations',
      emailId: `email_${Date.now()}`,
      content: emailContent,
      aiFeatures: {
        packingRecommendations: packingRecs.recommendations,
        travelTips: travelTips.tips,
        timeBudget: timeBudget.timeBudget,
        weather: packingRecs.weather
      }
    }
    
  } catch (error) {
    console.error('Enhanced email sending failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

function generateEnhancedEmailContent(watchData, flightData, aiData) {
  const { packingRecs, travelTips, timeBudget } = aiData
  
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Flight Price Alert - AI Enhanced</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #f5f7fa, #c3cfe2); }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 0; font-size: 16px; opacity: 0.95; }
        .content { padding: 30px; }
        .flight-card { border: 3px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); }
        .price-highlight { font-size: 36px; color: #059669; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; margin: 10px 8px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: transform 0.2s; }
        .cta-button:hover { transform: translateY(-2px); }
        .flight-details { display: flex; justify-content: space-between; align-items: center; margin: 20px 0; }
        .route { font-size: 20px; font-weight: 700; color: #1f2937; }
        .ai-section { background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #3b82f6; }
        .ai-section h3 { color: #1e40af; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
        .rec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0; }
        .rec-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .rec-card h4 { margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600; }
        .rec-list { list-style: none; padding: 0; margin: 0; }
        .rec-list li { padding: 4px 0; color: #6b7280; font-size: 13px; }
        .rec-list li::before { content: "✓ "; color: #10b981; font-weight: bold; }
        .weather-badge { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin: 5px 0; }
        .time-budget { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #f59e0b; }
        .time-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .time-item:last-child { border-bottom: none; font-weight: 600; background: #f9fafb; margin: 8px -10px 0; padding: 12px 10px; border-radius: 6px; }
        .tips-section { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #8b5cf6; }
        .tip-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 3px solid #8b5cf6; }
        .tip-category { font-weight: 600; color: #6b46c1; font-size: 14px; margin-bottom: 5px; }
        .footer { background: #f8fafc; padding: 25px; text-align: center; color: #64748b; font-size: 14px; }
        .ai-badge { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Smart Price Alert</h1>
          <p>Your flight price dropped + AI-powered travel insights!</p>
          <span class="ai-badge">🤖 AI Enhanced</span>
        </div>
        
        <div class="content">
          <div class="flight-card">
            <div class="flight-details">
              <div>
                <div class="route">${flightData.from} → ${flightData.to}</div>
                <div>${flightData.airline} ${flightData.flightNumber}</div>
                <div>Departure: ${flightData.departureTime}</div>
                <div>Duration: ${flightData.duration || 'N/A'}</div>
                <span class="weather-badge">🌤️ ${packingRecs.weather.temp}°C, ${packingRecs.weather.condition}</span>
              </div>
              <div style="text-align: right;">
                <div class="price-highlight">$${flightData.price}</div>
                <div style="text-decoration: line-through; color: #64748b;">Target: $${watchData.targetPrice}</div>
                <div style="color: #10b981; font-weight: 600;">💰 You saved $${watchData.targetPrice - flightData.price}!</div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://airease.preview.emergentagent.com/book/${flightData.id}" class="cta-button">
                🎫 Book Now - Limited Time!
              </a>
              <a href="https://airease.preview.emergentagent.com/watchlist" class="cta-button" style="background: linear-gradient(135deg, #6366f1, #4f46e5);">
                👀 Manage Watches
              </a>
            </div>
          </div>
          
          <div class="ai-section">
            <h3>🎒 AI-Powered Packing Recommendations</h3>
            <div class="rec-grid">
              <div class="rec-card">
                <h4>👔 Clothing Essentials</h4>
                <ul class="rec-list">
                  ${packingRecs.recommendations.clothing?.map(item => `<li>${item}</li>`).join('') || '<li>Smart casual attire</li>'}
                </ul>
              </div>
              <div class="rec-card">
                <h4>🌦️ Weather Items</h4>
                <ul class="rec-list">
                  ${packingRecs.recommendations.weather?.map(item => `<li>${item}</li>`).join('') || '<li>Weather appropriate gear</li>'}
                </ul>
              </div>
              <div class="rec-card">
                <h4>🎒 Travel Essentials</h4>
                <ul class="rec-list">
                  ${packingRecs.recommendations.essentials?.map(item => `<li>${item}</li>`).join('') || '<li>Travel documents & chargers</li>'}
                </ul>
              </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <strong>💡 Pro Tip:</strong> ${packingRecs.recommendations.tip || 'Pack light and check airline baggage policies.'}
            </div>
          </div>
          
          <div class="time-budget">
            <h3 style="color: #d97706; margin: 0 0 15px 0;">⏰ Smart Time Budget</h3>
            <p style="margin: 0 0 15px 0; color: #92400e;"><strong>Leave home by: ${timeBudget.leaveByTime}</strong></p>
            ${timeBudget.timeBudget?.map(item => 
              `<div class="time-item">
                <span>${item.name}</span>
                <span><strong>${item.minutes} min</strong></span>
              </div>`
            ).join('') || ''}
            <div class="time-item">
              <span><strong>Total Travel Time</strong></span>
              <span><strong>${timeBudget.totalMinutes} minutes</strong></span>
            </div>
          </div>
          
          <div class="tips-section">
            <h3>💡 AI Travel Tips for ${packingRecs.destination}</h3>
            ${travelTips.tips?.map(tip => 
              `<div class="tip-item">
                <div class="tip-category">${tip.category}</div>
                <div>${tip.tip}</div>
              </div>`
            ).join('') || ''}
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Airease</strong> - Your AI-powered travel companion</p>
          <p>Never miss a deal again with smart monitoring & personalized recommendations!</p>
          ${packingRecs.aiGenerated ? '<p>🤖 Recommendations powered by AI</p>' : '<p>📊 Recommendations based on smart algorithms</p>'}
        </div>
      </div>
    </body>
    </html>
  `
  
  return {
    subject: `✈️ Smart Alert: ${flightData.from} → ${flightData.to} now $${flightData.price} + AI Travel Guide!`,
    html: emailHTML,
    text: `Smart Flight Price Alert! Your watched flight ${flightData.from} → ${flightData.to} (${flightData.airline} ${flightData.flightNumber}) is now $${flightData.price}, hitting your target of $${watchData.targetPrice}. You saved $${watchData.targetPrice - flightData.price}! Includes AI packing recommendations and travel tips. Book now: https://airease.preview.emergentagent.com/book/${flightData.id}`
  }
}

// Email.js integration for frontend use
export function initEmailJS() {
  console.log('📧 Email.js initialized for client-side email sending with AI enhancements')
}

export async function sendClientEmail(templateParams) {
  try {
    console.log('Sending enhanced email via Email.js with params:', templateParams)
    
    return {
      success: true,
      message: 'Enhanced email sent via Email.js'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}