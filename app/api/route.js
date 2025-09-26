import { NextResponse } from 'next/server'

export async function GET(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  return NextResponse.json({ 
    message: 'Airease API is running!',
    version: '2.0',
    status: 'healthy',
    features: ['Flight Search', 'Gemini AI Recommendations', 'Price Monitoring', 'Email Alerts'],
    geminiAI: true,
    timestamp: new Date().toISOString()
  }, { headers })
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