import { NextResponse } from 'next/server'
import { generateAIRecommendations } from '../../../../lib/emergentLlm.js'

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const { flightData } = await request.json()
    console.log('🤖 AI recommendations requested for:', flightData.from, '→', flightData.to)
    
    const recommendations = await generateAIRecommendations(flightData)
    
    return NextResponse.json({
      success: true,
      recommendations,
      flightInfo: flightData,
      timestamp: new Date().toISOString()
    }, { headers })
  } catch (error) {
    console.error('AI recommendations error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'AI recommendations failed',
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