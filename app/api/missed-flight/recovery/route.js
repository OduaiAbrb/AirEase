import { NextResponse } from 'next/server'
import { generateRealisticFlights } from '../../../../lib/realisticFlightData.js'

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const { flightNumber, originalDate, from, to, reason } = await request.json()
    
    console.log('🚨 Missed Flight Recovery Request:')
    console.log('Original Flight:', flightNumber, 'on', originalDate)
    console.log('Route:', from, '→', to)
    console.log('Reason:', reason || 'Not specified')
    
    // Generate recovery options for same day and next day
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const tomorrow = new Date(now.getTime() + 24*60*60*1000).toISOString().split('T')[0]
    
    // Get flights for today (remaining flights)
    const todayFlights = generateRealisticFlights({
      from,
      to,
      departDate: today,
      maxPrice: 1200
    }).filter(flight => {
      // Only flights departing after current time + 2 hours minimum
      const flightTime = new Date()
      const [hour, minute] = flight.departureTime.split(':')
      flightTime.setHours(parseInt(hour), parseInt(minute))
      return flightTime.getTime() > now.getTime() + 2*60*60*1000
    }).slice(0, 3)
    
    // Get flights for tomorrow
    const tomorrowFlights = generateRealisticFlights({
      from,
      to, 
      departDate: tomorrow,
      maxPrice: 1200
    }).slice(0, 2)
    
    // Combine and prioritize options
    const allOptions = [
      ...todayFlights.map(flight => ({
        ...flight,
        type: 'same-day',
        priority: flight.stops === 0 ? 'high' : 'medium',
        urgency: 'urgent'
      })),
      ...tomorrowFlights.map(flight => ({
        ...flight,
        type: 'next-day', 
        priority: 'budget',
        urgency: 'standard'
      }))
    ]
    
    // Sort by priority and price
    const sortedOptions = allOptions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, budget: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return a.price - b.price
    })
    
    // Emergency contact numbers
    const emergencyContacts = {
      airline: getAirlineContact(flightNumber),
      airport: getAirportContact(from),
      insurance: '+1-800-555-HELP (4357)',
      embassy: getEmbassyContact(from, to)
    }
    
    console.log('✅ Found', sortedOptions.length, 'recovery options')
    console.log('Same day options:', todayFlights.length)
    console.log('Next day options:', tomorrowFlights.length)
    
    return NextResponse.json({
      success: true,
      options: sortedOptions.slice(0, 6), // Limit to 6 best options
      emergencyContacts,
      originalFlight: { flightNumber, originalDate, from, to },
      searchTime: new Date().toISOString(),
      recommendations: generateRecoveryTips(reason, from, to)
    }, { headers })
    
  } catch (error) {
    console.error('Missed flight recovery error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to find recovery options',
      details: error.message
    }, { status: 500, headers })
  }
}

function getAirlineContact(flightNumber) {
  const airlineContacts = {
    'QR': '+974 4023-0000', // Qatar Airways
    'EK': '+971 4-214-4444', // Emirates
    'TK': '+90 212 444-0849', // Turkish Airlines
    'LH': '+49 69 86-799-799', // Lufthansa
    'BA': '+44 344 493-0787', // British Airways
    'AF': '+33 36-54', // Air France
    'KL': '+31 20-474-7747', // KLM
  }
  
  const airlineCode = flightNumber.slice(0, 2)
  return airlineContacts[airlineCode] || '+1-800-555-AIRLINE'
}

function getAirportContact(airportCode) {
  const airportContacts = {
    'JFK': '+1-718-244-4444',
    'LHR': '+44 844 335-1801', 
    'CDG': '+33 1-70-36-39-50',
    'DXB': '+971 4-224-5555',
    'AMM': '+962 6-445-1200',
    'IST': '+90 212 463-3000'
  }
  
  return airportContacts[airportCode] || '+1-800-555-AIRPORT'
}

function getEmbassyContact(from, to) {
  // Simplified embassy contact based on route
  if (from.includes('US') || to.includes('US')) {
    return '+1-888-407-4747' // US State Dept
  }
  if (from.includes('UK') || to.includes('UK')) {
    return '+44 20-7008-1500' // UK Foreign Office
  }
  return '+1-800-555-EMBASSY'
}

function generateRecoveryTips(reason, from, to) {
  const tips = [
    'Contact your airline immediately for rebooking options',
    'Check if you have travel insurance coverage for missed flights',
    'Keep all receipts for accommodation and meals',
    'Consider alternative airports in the same city'
  ]
  
  if (reason && reason.toLowerCase().includes('weather')) {
    tips.push('Weather delays may qualify for compensation')
    tips.push('Airlines often waive change fees for weather disruptions')
  }
  
  if (reason && reason.toLowerCase().includes('connection')) {
    tips.push('Missed connections due to airline delays are usually reboked free')
    tips.push('Request meal vouchers if waiting overnight')
  }
  
  return tips
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