import { NextResponse } from 'next/server'
import { generateAIRecommendations } from '../../../../lib/emergentLlm.js'

async function sendPriceAlert(watchData, flightData) {
  console.log('📧 ENHANCED PRICE ALERT EMAIL!')
  console.log('To:', watchData.email)
  console.log('Subject: 🎯 Price Alert: Flight Deal Found!')
  
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

export async function GET(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
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
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Test email failed',
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