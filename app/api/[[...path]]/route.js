import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { generateAIRecommendations } from '../../../lib/emergentLlm.js'

// MongoDB Connection
let client
let db

async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URL)
      await client.connect()
      db = client.db(process.env.DB_NAME)
    }
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Enhanced mock flight data generator
function generateMockFlights(searchParams) {
  console.log('🔍 Generating mock flights for:', searchParams)
  
  const airlines = [
    { name: 'Qatar Airways', code: 'QR', quality: 'premium' },
    { name: 'Emirates', code: 'EK', quality: 'premium' },
    { name: 'Turkish Airlines', code: 'TK', quality: 'good' },
    { name: 'Lufthansa', code: 'LH', quality: 'good' },
    { name: 'British Airways', code: 'BA', quality: 'good' },
    { name: 'KLM', code: 'KL', quality: 'standard' }
  ]
  
  const flights = []
  const basePrice = parseInt(searchParams.maxPrice) || 600
  
  for (let i = 0; i < 6; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    
    // Generate more realistic pricing based on airline quality
    const priceMultiplier = airline.quality === 'premium' ? 1.2 : 
                           airline.quality === 'good' ? 1.0 : 0.8
    const variance = Math.random() * 400 - 200 // ±200 variance
    const price = Math.max(150, Math.floor((basePrice * priceMultiplier) + variance))
    
    // Generate realistic flight times
    const depHour = Math.floor(Math.random() * 18) + 6 // 6 AM to midnight
    const depMinute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, 45
    const flightHours = Math.floor(Math.random() * 8) + 3 // 3-11 hours
    const flightMinutes = Math.floor(Math.random() * 4) * 15
    
    const arrHour = (depHour + flightHours) % 24
    const arrMinute = (depMinute + flightMinutes) % 60
    
    // Add day change indicator if needed
    const nextDay = depHour + flightHours >= 24
    
    flights.push({
      id: uuidv4(),
      from: searchParams.from || 'AMM',
      to: searchParams.to || 'LHR',
      airline: airline.name,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 899) + 100}`,
      departureTime: `${String(depHour).padStart(2, '0')}:${String(depMinute).padStart(2, '0')}`,
      arrivalTime: `${String(arrHour).padStart(2, '0')}:${String(arrMinute).padStart(2, '0')}${nextDay ? '+1' : ''}`,
      duration: `${flightHours}h ${flightMinutes}m`,
      price: price,
      stops: Math.random() < 0.3 ? 1 : 0, // 30% chance of 1 stop
      baggage: airline.quality === 'premium' ? '2 bags included' : '1 bag included',
      quality: airline.quality,
      amenities: airline.quality === 'premium' ? 
        ['Wi-Fi', 'Entertainment', 'Meals', 'Priority boarding'] : 
        ['Entertainment', 'Snacks']
    })
  }
  
  // Sort by price (ascending)
  return flights.sort((a, b) => a.price - b.price)
}

// Enhanced mock email function
async function sendPriceAlert(watchData, flightData) {
  console.log('📧 ENHANCED PRICE ALERT EMAIL!')
  console.log('To:', watchData.email)
  console.log('Subject: 🎯 Price Alert: Flight Deal Found!')
  
  // Generate AI recommendations for the email
  const aiRecs = await generateAIRecommendations(flightData, watchData)
  
  console.log('✈️ Flight Details:')
  console.log(`   ${flightData.from} → ${flightData.to}`)
  console.log(`   ${flightData.airline} ${flightData.flightNumber}`)
  console.log(`   Price: $${flightData.price} (Target: $${watchData.targetPrice})`)
  
  console.log('🎒 AI Packing Recommendations:')
  console.log('   Weather:', aiRecs.weatherInfo.temp + '°C,', aiRecs.weatherInfo.condition)
  console.log('   Clothing:', aiRecs.packingList.clothing.slice(0, 2).join(', '))
  
  console.log('💡 Travel Tips:')
  aiRecs.travelTips.slice(0, 2).forEach(tip => {
    console.log(`   ${tip.category}: ${tip.tip.substring(0, 60)}...`)
  })
  
  console.log('⏰ Time Management:')
  console.log(`   Leave by: ${aiRecs.timeManagement.leaveBy}`)
  console.log(`   Total travel time: ${aiRecs.timeManagement.totalMinutes} minutes`)
  
  return {
    success: true,
    message: 'Enhanced price alert sent with AI recommendations',
    emailId: `enhanced_${Date.now()}`,
    aiRecommendations: aiRecs
  }
}

// Enhanced price monitoring
async function checkFlightPrices() {
  console.log('🤖 AI-ENHANCED PRICE MONITORING')
  console.log('Scanning multiple airlines and routes...')
  
  // Simulate checking multiple watchlists
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const mockChecks = [
    { route: 'AMM → LHR', currentPrice: 445, targetPrice: 500, matched: true },
    { route: 'JFK → CDG', currentPrice: 620, targetPrice: 600, matched: false },
    { route: 'DXB → LAX', currentPrice: 780, targetPrice: 750, matched: false }
  ]
  
  const matches = mockChecks.filter(check => check.matched)
  
  console.log('📊 Price Check Results:')
  mockChecks.forEach(check => {
    const status = check.matched ? '🎯 MATCH' : '📈 ABOVE TARGET'
    console.log(`   ${check.route}: $${check.currentPrice} (target: $${check.targetPrice}) ${status}`)
  })
  
  console.log('✅ AI-enhanced price monitoring completed')
  
  return {
    success: true,
    watchesChecked: mockChecks.length,
    matchesFound: matches.length,
    notificationsSent: matches.length,
    timestamp: new Date().toISOString(),
    aiEnhanced: true
  }
}

// API Router with CORS
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    if (pathname === '/api/' || pathname === '/api') {
      return NextResponse.json({ 
        message: 'Airease API is running!',
        version: '2.0',
        status: 'healthy',
        features: ['Flight Search', 'AI Recommendations', 'Price Monitoring', 'Email Alerts'],
        emergentLlm: true,
        timestamp: new Date().toISOString()
      }, { headers })
    }
    
    if (pathname === '/api/flights/check-prices') {
      const result = await checkFlightPrices()
      return NextResponse.json({ 
        message: 'AI-enhanced price monitoring completed',
        result 
      }, { headers })
    }
    
    if (pathname === '/api/notifications/test') {
      const mockWatch = {
        email: 'user@airease.com',
        targetPrice: 500,
        from: 'AMM',
        to: 'LHR'
      }
      
      const mockFlight = {
        from: 'AMM',
        to: 'LHR',
        airline: 'Qatar Airways',
        flightNumber: 'QR123',
        departureTime: '14:30',
        price: 445
      }
      
      const result = await sendPriceAlert(mockWatch, mockFlight)
      return NextResponse.json({ 
        message: 'AI-enhanced test email sent',
        result 
      }, { headers })
    }
    
    if (pathname === '/api/watchlist') {
      try {
        const db = await connectDB()
        const watchlists = await db.collection('watchlists').find({}).toArray()
        return NextResponse.json({ 
          watchlists: watchlists || [],
          count: watchlists?.length || 0
        }, { headers })
      } catch (error) {
        console.error('Watchlist fetch error:', error)
        return NextResponse.json({ 
          watchlists: [],
          error: 'Database unavailable - using mock mode'
        }, { headers })
      }
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404, headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500, headers })
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    if (pathname === '/api/flights/search') {
      const searchParams = await request.json()
      console.log('✈️ Flight search request:', searchParams)
      
      // Generate mock flights (no external API calls)
      const flights = generateMockFlights(searchParams)
      console.log(`📊 Generated ${flights.length} mock flights (sorted by price)`)
      
      return NextResponse.json({ 
        success: true,
        flights,
        searchParams,
        mockData: true,
        timestamp: new Date().toISOString()
      }, { headers })
    }
    
    if (pathname === '/api/flights/ai-recommendations') {
      const { flightData } = await request.json()
      console.log('🤖 AI recommendations requested for:', flightData.from, '→', flightData.to)
      
      const recommendations = await generateAIRecommendations(flightData)
      
      return NextResponse.json({
        success: true,
        recommendations,
        flightInfo: flightData,
        timestamp: new Date().toISOString()
      }, { headers })
    }
    
    if (pathname === '/api/watchlist') {
      const watchData = await request.json()
      console.log('📝 Creating watchlist:', watchData)
      
      try {
        const db = await connectDB()
        
        const newWatch = {
          id: uuidv4(),
          ...watchData,
          active: true,
          createdAt: new Date(),
          lastCheck: new Date(),
          aiEnhanced: true
        }
        
        await db.collection('watchlists').insertOne(newWatch)
        console.log('✅ Watchlist created successfully in database')
        
        return NextResponse.json({ 
          success: true, 
          watch: newWatch,
          message: 'AI-enhanced price watch created! You\'ll receive smart notifications with travel recommendations.'
        }, { headers })
      } catch (error) {
        console.error('Database error, using mock mode:', error)
        
        // Fallback to mock response
        const mockWatch = {
          id: uuidv4(),
          ...watchData,
          active: true,
          createdAt: new Date(),
          mockMode: true
        }
        
        return NextResponse.json({ 
          success: true, 
          watch: mockWatch,
          message: 'Price watch created (mock mode)! Database unavailable.'
        }, { headers })
      }
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404, headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500, headers })
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}