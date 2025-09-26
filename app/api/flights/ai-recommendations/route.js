import { NextResponse } from 'next/server'
import { 
  generatePackingRecommendations, 
  generateTravelTips, 
  calculateTimeBudget 
} from '../../../../lib/geminiAI.js'

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const { flightData } = await request.json()
    console.log('🤖 Gemini AI recommendations requested for:', flightData.from, '→', flightData.to)
    
    // Generate comprehensive AI recommendations using Gemini
    const [packingRecs, travelTips, timeBudget] = await Promise.all([
      generatePackingRecommendations(flightData, { tripType: 'leisure', duration: '3-5 days' }),
      generateTravelTips(flightData),
      calculateTimeBudget(flightData)
    ])
    
    return NextResponse.json({
      success: true,
      packingRecs,
      travelTips,
      timeBudget,
      flightInfo: flightData,
      geminiAI: true,
      timestamp: new Date().toISOString()
    }, { headers })
  } catch (error) {
    console.error('Gemini AI recommendations error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Gemini AI recommendations failed',
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