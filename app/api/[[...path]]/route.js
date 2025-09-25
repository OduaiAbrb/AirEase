import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// MongoDB Connection
let client
let db

async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URL)
      await client.connect()
      db = client.db(process.env.DB_NAME || 'airease')
    }
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Mock flight data generator
function generateMockFlights(searchParams) {
  const airlines = ['Qatar Airways', 'Emirates', 'Turkish Airlines', 'Lufthansa', 'British Airways', 'KLM']
  const flights = []
  
  for (let i = 0; i < 6; i++) {
    const basePrice = Math.floor(Math.random() * 600) + 200
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    
    // Generate realistic flight times
    const depHour = Math.floor(Math.random() * 16) + 6 // 6 AM to 10 PM
    const depMinute = Math.floor(Math.random() * 60)
    const flightDuration = Math.floor(Math.random() * 10) + 2 // 2-12 hours
    const arrHour = (depHour + flightDuration) % 24
    const arrMinute = (depMinute + Math.floor(Math.random() * 60)) % 60
    
    flights.push({
      id: uuidv4(),
      from: searchParams.from || 'AMM',
      to: searchParams.to || 'LHR', 
      airline,
      flightNumber: `${airline.slice(0,2).toUpperCase()}${Math.floor(Math.random() * 999) + 100}`,
      departureTime: `${String(depHour).padStart(2, '0')}:${String(depMinute).padStart(2, '0')}`,
      arrivalTime: `${String(arrHour).padStart(2, '0')}:${String(arrMinute).padStart(2, '0')}`,
      duration: `${flightDuration}h ${Math.floor(Math.random() * 60)}m`,
      price: basePrice,
      stops: Math.floor(Math.random() * 2),
      baggage: '1 checked bag included'
    })
  }
  
  return flights.sort((a, b) => a.price - b.price)
}

// Mock email function
async function sendTestEmail() {
  console.log('📧 TEST EMAIL SENT!')
  console.log('Subject: Flight Price Alert Test')
  console.log('Content: Your Airease price monitoring is working correctly!')
  
  return {
    success: true,
    message: 'Test email sent successfully',
    emailId: `test_${Date.now()}`
  }
}

// Mock price checking
async function mockPriceCheck() {
  console.log('🔍 PRICE CHECK INITIATED')
  console.log('Checking flight prices across airlines...')
  
  // Simulate checking multiple watchlists
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('✅ Price check completed')
  return {
    success: true,
    watchesChecked: 3,
    notificationsSent: 1,
    timestamp: new Date().toISOString()
  }
}

// API Router
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    if (pathname === '/api/' || pathname === '/api') {
      return NextResponse.json({ 
        message: 'Airease API is running!',
        version: '1.0',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }, { headers })
    }
    
    if (pathname === '/api/flights/check-prices') {
      const result = await mockPriceCheck()
      return NextResponse.json({ 
        message: 'Price check completed',
        result 
      }, { headers })
    }
    
    if (pathname === '/api/notifications/test') {
      const result = await sendTestEmail()
      return NextResponse.json({ 
        message: 'Test email sent',
        result 
      }, { headers })
    }
    
    if (pathname === '/api/watchlist') {
      try {
        const db = await connectDB()
        const watchlists = await db.collection('watchlists').find({}).toArray()
        return NextResponse.json({ 
          watchlists: watchlists || [] 
        }, { headers })
      } catch (error) {
        console.error('Watchlist fetch error:', error)
        return NextResponse.json({ 
          watchlists: [],
          error: 'Database connection issue'
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
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    if (pathname === '/api/flights/search') {
      const searchParams = await request.json()
      console.log('Flight search request:', searchParams)
      
      // Use flight API key if available
      if (process.env.FLIGHT_API_KEY) {
        console.log('Using flight API key:', process.env.FLIGHT_API_KEY)
      }
      
      const flights = generateMockFlights(searchParams)
      console.log(`Generated ${flights.length} flights`)
      
      return NextResponse.json({ 
        flights,
        searchParams,
        timestamp: new Date().toISOString()
      }, { headers })
    }
    
    if (pathname === '/api/watchlist') {
      const watchData = await request.json()
      console.log('Creating watchlist:', watchData)
      
      try {
        const db = await connectDB()
        
        const newWatch = {
          id: uuidv4(),
          ...watchData,
          active: true,
          createdAt: new Date(),
          lastCheck: new Date()
        }
        
        await db.collection('watchlists').insertOne(newWatch)
        console.log('Watchlist created successfully')
        
        return NextResponse.json({ 
          success: true, 
          watch: newWatch,
          message: 'Price watch created successfully!'
        }, { headers })
      } catch (error) {
        console.error('Watchlist creation error:', error)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create watchlist'
        }, { status: 500, headers })
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