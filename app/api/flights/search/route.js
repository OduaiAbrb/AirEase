import { NextResponse } from 'next/server'
import { generateRealisticFlights } from '../../../../lib/realisticFlightData.js'

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const searchParams = await request.json()
    console.log('✈️ Enhanced flight search request:', searchParams)
    
    // Generate realistic flights using our enhanced data
    const flights = generateRealisticFlights(searchParams)
    console.log(`📊 Generated ${flights.length} realistic flights (sorted by price)`)
    
    // Add real-time pricing updates simulation
    const flightsWithUpdates = flights.map(flight => ({
      ...flight,
      lastUpdated: new Date().toISOString(),
      priceHistory: generatePriceHistory(flight.price),
      availabilityStatus: generateAvailabilityStatus(),
      bookingClass: 'Economy',
      refundable: flight.quality === 'premium'
    }))
    
    return NextResponse.json({ 
      success: true,
      flights: flightsWithUpdates,
      searchParams,
      totalResults: flightsWithUpdates.length,
      searchId: `search_${Date.now()}`,
      currency: 'USD',
      timestamp: new Date().toISOString()
    }, { headers })
  } catch (error) {
    console.error('Enhanced flight search error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Flight search failed',
      details: error.message
    }, { status: 500, headers })
  }
}

function generatePriceHistory(currentPrice) {
  const history = []
  let price = currentPrice
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.1 // ±5%
    price = Math.round(currentPrice * (1 + variation))
    
    history.push({
      date: date.toISOString().split('T')[0],
      price
    })
  }
  
  return history
}

function generateAvailabilityStatus() {
  const statuses = [
    { seats: Math.floor(Math.random() * 9) + 1, message: 'Few seats left!' },
    { seats: Math.floor(Math.random() * 20) + 10, message: 'Good availability' },
    { seats: Math.floor(Math.random() * 50) + 25, message: 'Many seats available' }
  ]
  
  return statuses[Math.floor(Math.random() * statuses.length)]
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