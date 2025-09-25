import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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
    
    const priceMultiplier = airline.quality === 'premium' ? 1.2 : 
                           airline.quality === 'good' ? 1.0 : 0.8
    const variance = Math.random() * 400 - 200
    const price = Math.max(150, Math.floor((basePrice * priceMultiplier) + variance))
    
    const depHour = Math.floor(Math.random() * 18) + 6
    const depMinute = Math.floor(Math.random() * 4) * 15
    const flightHours = Math.floor(Math.random() * 8) + 3
    const flightMinutes = Math.floor(Math.random() * 4) * 15
    
    const arrHour = (depHour + flightHours) % 24
    const arrMinute = (depMinute + flightMinutes) % 60
    
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
      stops: Math.random() < 0.3 ? 1 : 0,
      baggage: airline.quality === 'premium' ? '2 bags included' : '1 bag included',
      quality: airline.quality,
      amenities: airline.quality === 'premium' ? 
        ['Wi-Fi', 'Entertainment', 'Meals', 'Priority boarding'] : 
        ['Entertainment', 'Snacks']
    })
  }
  
  return flights.sort((a, b) => a.price - b.price)
}

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const searchParams = await request.json()
    console.log('✈️ Flight search request:', searchParams)
    
    const flights = generateMockFlights(searchParams)
    console.log(`📊 Generated ${flights.length} mock flights (sorted by price)`)
    
    return NextResponse.json({ 
      success: true,
      flights,
      searchParams,
      mockData: true,
      timestamp: new Date().toISOString()
    }, { headers })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Flight search failed',
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