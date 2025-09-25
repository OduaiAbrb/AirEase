import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

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
    // For now, using mock data as flight API integration needs specific endpoint
    // Will implement real API call once we get the exact API endpoint details
    console.log('Using flight API key:', process.env.FLIGHT_API_KEY)
    
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

// Price monitoring function
async function checkPriceMatches() {
  const db = await connectDB()
  const watchCollection = db.collection('watchlists')
  
  try {
    const watches = await watchCollection.find({ active: true }).toArray()
    
    for (const watch of watches) {
      // Get current flight prices
      const currentFlights = await searchFlights({
        from: watch.from,
        to: watch.to,
        departDate: watch.departDate
      })
      
      // Find flights under target price
      const matchedFlights = currentFlights.filter(flight => 
        flight.price <= watch.targetPrice
      )
      
      if (matchedFlights.length > 0) {
        // Trigger notification
        await sendPriceAlert(watch, matchedFlights[0])
        
        // Update watch status
        await watchCollection.updateOne(
          { _id: watch._id },
          { 
            $set: { 
              lastMatch: new Date(),
              matchedPrice: matchedFlights[0].price 
            } 
          }
        )
      }
    }
  } catch (error) {
    console.error('Price checking error:', error)
  }
}

// Email notification (placeholder for Email.js integration)
async function sendPriceAlert(watch, flight) {
  console.log(`🎯 PRICE ALERT: Flight ${flight.flightNumber} from ${flight.from} to ${flight.to} now costs $${flight.price} (target: $${watch.targetPrice})`)
  
  // Email.js integration will be implemented in Phase 4
  // This would send actual email notifications
  return { sent: true }
}

// API Router
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  try {
    if (pathname === '/api/' || pathname === '/api') {
      return NextResponse.json({ message: 'Airease API is running!' })
    }
    
    if (pathname === '/api/flights/check-prices') {
      await checkPriceMatches()
      return NextResponse.json({ message: 'Price check completed' })
    }
    
    if (pathname === '/api/watchlist') {
      const db = await connectDB()
      const watchlists = await db.collection('watchlists').find({}).toArray()
      return NextResponse.json({ watchlists })
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
        lastCheck: new Date()
      }
      
      await db.collection('watchlists').insertOne(newWatch)
      
      return NextResponse.json({ 
        success: true, 
        watch: newWatch,
        message: 'Flight watch created successfully'
      })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  return NextResponse.json({ message: 'PUT method handler' })
}

export async function DELETE(request) {
  return NextResponse.json({ message: 'DELETE method handler' })
}