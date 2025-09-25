import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { checkPriceMatches, triggerPriceCheck } from '../../../lib/priceMonitor.js'
import { sendPriceAlert } from '../../../lib/emailService.js'
import { generatePackingRecommendations, generateTravelTips, calculateTimeBudget } from '../../../lib/aiRecommendations.js'

// MongoDB Connection
let client
let db

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Mock flight data generator
function generateMockFlights(searchParams) {
  const airlines = ['Qatar Airways', 'Emirates', 'Turkish Airlines', 'Lufthansa', 'British Airways', 'KLM']
  const flights = []
  
  for (let i = 0; i < 6; i++) {
    const basePrice = Math.floor(Math.random() * 800) + 200
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    
    flights.push({
      id: uuidv4(),
      from: searchParams.from || 'AMM',
      to: searchParams.to || 'LHR', 
      airline,
      flightNumber: `${airline.slice(0,2).toUpperCase()}${Math.floor(Math.random() * 999) + 100}`,
      departureTime: `${String(6 + i).padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      arrivalTime: `${String(10 + i).padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      duration: `${Math.floor(Math.random() * 8) + 2}h ${Math.floor(Math.random() * 60)}m`,
      price: basePrice,
      stops: Math.floor(Math.random() * 2),
      baggage: '1 checked bag included'
    })
  }
  
  return flights.sort((a, b) => a.price - b.price)
}

// Real flight search using provided API key
async function searchFlights(searchParams) {
  try {
    console.log('Using flight API key:', process.env.FLIGHT_API_KEY)
    
    // For now, using mock data as flight API integration needs specific endpoint
    // Will implement real API call once we get the exact API endpoint details
    
    // This would be the real API call structure:
    // const response = await fetch(`https://flight-api-endpoint.com/search`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.FLIGHT_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(searchParams)
    // })
    
    // For demo purposes, return enhanced mock data
    return generateMockFlights(searchParams)
  } catch (error) {
    console.error('Flight search error:', error)
    return generateMockFlights(searchParams)
  }
}

// API Router
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  try {
    if (pathname === '/api/' || pathname === '/api') {
      return NextResponse.json({ 
        message: 'Airease API is running!',
        features: ['Flight Search', 'Price Monitoring', 'Email Alerts', 'Watchlists'],
        version: '2.0'
      })
    }
    
    if (pathname === '/api/flights/check-prices') {
      const db = await connectDB()
      const result = await triggerPriceCheck(db)
      return NextResponse.json({ 
        message: 'Price check completed',
        result 
      })
    }
    
    if (pathname === '/api/watchlist') {
      const db = await connectDB()
      const watchlists = await db.collection('watchlists').find({}).toArray()
      return NextResponse.json({ watchlists })
    }
    
    if (pathname === '/api/notifications/test') {
      // Test AI-enhanced email notification
      const mockWatch = {
        id: 'test_watch',
        from: 'AMM',
        to: 'LHR',
        targetPrice: 500,
        email: 'user@example.com',
        tripType: 'leisure'
      }
      
      const mockFlight = {
        id: 'test_flight',
        from: 'AMM',
        to: 'LHR',
        airline: 'Qatar Airways',
        flightNumber: 'QR123',
        departureTime: '08:30',
        duration: '6h 15m',
        price: 450
      }
      
      const result = await sendPriceAlert(mockWatch, mockFlight)
      return NextResponse.json({ 
        message: 'Test AI-enhanced email sent',
        result 
      })
    }
    
    if (pathname === '/api/ai/recommendations') {
      return NextResponse.json({ error: 'Use POST method for AI recommendations' }, { status: 405 })
    }
    
    if (pathname === '/api/ai/packing') {
      return NextResponse.json({ error: 'Use POST method for packing recommendations' }, { status: 405 })
    }
    
    if (pathname === '/api/ai/travel-tips') {
      return NextResponse.json({ error: 'Use POST method for travel tips' }, { status: 405 })
    }
    
    if (pathname === '/api/ai/time-budget') {
      return NextResponse.json({ error: 'Use POST method for time budget' }, { status: 405 })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  
  try {
    if (pathname === '/api/flights/search') {
      const searchParams = await request.json()
      const flights = await searchFlights(searchParams)
      return NextResponse.json({ 
        flights,
        searchParams,
        timestamp: new Date().toISOString()
      })
    }
    
    if (pathname === '/api/watchlist') {
      const watchData = await request.json()
      const db = await connectDB()
      
      const newWatch = {
        id: uuidv4(),
        ...watchData,
        active: true,
        createdAt: new Date(),
        lastCheck: new Date(),
        notificationCount: 0,
        email: watchData.email || 'user@example.com' // Default email for demo
      }
      
      await db.collection('watchlists').insertOne(newWatch)
      
      return NextResponse.json({ 
        success: true, 
        watch: newWatch,
        message: 'Flight watch created successfully! You\'ll receive email alerts when the price hits your target.'
      })
    }
    
    if (pathname === '/api/notifications/send') {
      const { watchId, flightData } = await request.json()
      const db = await connectDB()
      
      // Get watch details
      const watch = await db.collection('watchlists').findOne({ id: watchId })
      if (!watch) {
        return NextResponse.json({ error: 'Watch not found' }, { status: 404 })
      }
      
      // Send AI-enhanced notification
      const result = await sendPriceAlert(watch, flightData)
      
      return NextResponse.json({ 
        success: result.success,
        message: result.message,
        emailContent: result.content,
        aiFeatures: result.aiFeatures
      })
    }
    
    if (pathname === '/api/ai/recommendations') {
      const { flightData, tripType, duration } = await request.json()
      
      try {
        const packingRecs = await generatePackingRecommendations(flightData, { tripType, duration })
        const travelTips = await generateTravelTips(flightData, { tripType, duration })
        const timeBudget = await calculateTimeBudget(flightData)
        
        return NextResponse.json({
          success: true,
          packingRecs,
          travelTips,
          timeBudget,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('AI recommendations error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to generate recommendations' 
        }, { status: 500 })
      }
    }
    
    if (pathname === '/api/ai/packing') {
      const { flightData, tripType, duration } = await request.json()
      
      try {
        const recommendations = await generatePackingRecommendations(flightData, { tripType, duration })
        return NextResponse.json(recommendations)
      } catch (error) {
        console.error('Packing recommendations error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to generate packing recommendations' 
        }, { status: 500 })
      }
    }
    
    if (pathname === '/api/ai/travel-tips') {
      const { flightData, tripType } = await request.json()
      
      try {
        const tips = await generateTravelTips(flightData, { tripType })
        return NextResponse.json(tips)
      } catch (error) {
        console.error('Travel tips error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to generate travel tips' 
        }, { status: 500 })
      }
    }
    
    if (pathname === '/api/ai/time-budget') {
      const { flightData, userLocation } = await request.json()
      
      try {
        const timeBudget = await calculateTimeBudget(flightData, userLocation)
        return NextResponse.json(timeBudget)
      } catch (error) {
        console.error('Time budget error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to calculate time budget' 
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url)
  
  try {
    if (pathname === '/api/watchlist/toggle') {
      const { watchId, active } = await request.json()
      const db = await connectDB()
      
      await db.collection('watchlists').updateOne(
        { id: watchId },
        { $set: { active, updatedAt: new Date() } }
      )
      
      return NextResponse.json({ 
        success: true,
        message: `Watch ${active ? 'activated' : 'paused'}` 
      })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url)
  
  try {
    if (pathname.startsWith('/api/watchlist/')) {
      const watchId = pathname.split('/').pop()
      const db = await connectDB()
      
      await db.collection('watchlists').deleteOne({ id: watchId })
      
      return NextResponse.json({ 
        success: true,
        message: 'Watch deleted successfully' 
      })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}