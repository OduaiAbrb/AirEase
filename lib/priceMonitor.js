// Price monitoring engine for checking flight prices against user targets

import { sendPriceAlert } from './emailService.js'

// Mock flight price checking function
async function getCurrentFlightPrices(searchParams) {
  try {
    // In real implementation, this would call the actual flight API
    console.log('🔍 Checking current prices for:', searchParams)
    
    // Simulate API call with your flight API key
    console.log('Using flight API key:', process.env.FLIGHT_API_KEY)
    
    // Generate realistic price variations (simulate market fluctuations)
    const basePrice = 400 + Math.floor(Math.random() * 400)
    const priceVariation = Math.floor(Math.random() * 100) - 50 // ±50 price change
    
    const mockCurrentPrice = Math.max(200, basePrice + priceVariation)
    
    return {
      id: `flight_${Date.now()}`,
      from: searchParams.from,
      to: searchParams.to,
      airline: 'Qatar Airways',
      flightNumber: 'QR123',
      departureTime: '08:30',
      arrivalTime: '14:45',
      duration: '6h 15m',
      price: mockCurrentPrice,
      lastUpdated: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Failed to fetch current prices:', error)
    throw error
  }
}

// Main price monitoring function
export async function checkPriceMatches(db) {
  try {
    console.log('🤖 Starting automated price monitoring...')
    
    // Get all active watchlists
    const watchCollection = db.collection('watchlists')
    const activeWatches = await watchCollection.find({ active: true }).toArray()
    
    console.log(`📊 Found ${activeWatches.length} active price watches`)
    
    let notificationsSent = 0
    
    for (const watch of activeWatches) {
      try {
        // Get current flight prices for this watch
        const currentFlight = await getCurrentFlightPrices({
          from: watch.from,
          to: watch.to,
          departDate: watch.departDate
        })
        
        console.log(`💰 Current price for ${watch.from}→${watch.to}: $${currentFlight.price} (target: $${watch.targetPrice})`)
        
        // Check if current price meets or beats target
        if (currentFlight.price <= watch.targetPrice) {
          console.log(`🎯 PRICE MATCH! Sending notification...`)
          
          // Send price alert email
          const emailResult = await sendPriceAlert(watch, currentFlight)
          
          if (emailResult.success) {
            // Update watchlist with match details
            await watchCollection.updateOne(
              { id: watch.id },
              {
                $set: {
                  lastMatch: new Date(),
                  matchedPrice: currentFlight.price,
                  lastNotification: new Date(),
                  notificationCount: (watch.notificationCount || 0) + 1
                }
              }
            )
            
            notificationsSent++
            console.log(`✅ Notification sent for watch ${watch.id}`)
          } else {
            console.error(`❌ Failed to send notification for watch ${watch.id}:`, emailResult.error)
          }
          
        } else {
          // Update last check time even if no match
          await watchCollection.updateOne(
            { id: watch.id },
            { $set: { lastCheck: new Date() } }
          )
        }
        
      } catch (error) {
        console.error(`Error processing watch ${watch.id}:`, error)
      }
    }
    
    console.log(`📈 Price monitoring complete. Sent ${notificationsSent} notifications.`)
    
    return {
      success: true,
      watchesChecked: activeWatches.length,
      notificationsSent,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Price monitoring failed:', error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Scheduler function (would be called by cron job)
export function startPriceMonitoring(db) {
  console.log('🕐 Price monitoring scheduler started')
  
  // Run initial check
  checkPriceMatches(db)
  
  // Set up interval (every 30 minutes for demo, would be hourly in production)
  const monitoringInterval = setInterval(async () => {
    console.log('⏰ Running scheduled price check...')
    await checkPriceMatches(db)
  }, 30 * 60 * 1000) // 30 minutes
  
  return monitoringInterval
}

// Manual trigger for testing
export async function triggerPriceCheck(db) {
  console.log('🧪 Manual price check triggered')
  return await checkPriceMatches(db)
}