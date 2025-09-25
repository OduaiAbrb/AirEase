import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

let client
let db

async function connectDB() {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URL)
      await client.connect()
      db = client.db(process.env.DB_NAME)
    }
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export async function GET(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const db = await connectDB()
    const watchlists = await db.collection('watchlists').find({}).toArray()
    return NextResponse.json({ 
      watchlists: watchlists || [],
      count: watchlists?.length || 0
    }, { headers })
  } catch (error) {
    console.error('Watchlist fetch error:', error)
    return NextResponse.json({ 
      watchlists: [],
      error: 'Database unavailable - using mock mode'
    }, { headers })
  }
}

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const watchData = await request.json()
    console.log('📝 Creating watchlist:', watchData)
    
    try {
      const db = await connectDB()
      
      const newWatch = {
        id: uuidv4(),
        ...watchData,
        active: true,
        createdAt: new Date(),
        lastCheck: new Date(),
        aiEnhanced: true
      }
      
      await db.collection('watchlists').insertOne(newWatch)
      console.log('✅ Watchlist created successfully in database')
      
      return NextResponse.json({ 
        success: true, 
        watch: newWatch,
        message: 'AI-enhanced price watch created! You\'ll receive smart notifications with travel recommendations.'
      }, { headers })
    } catch (error) {
      console.error('Database error, using mock mode:', error)
      
      const mockWatch = {
        id: uuidv4(),
        ...watchData,
        active: true,
        createdAt: new Date(),
        mockMode: true
      }
      
      return NextResponse.json({ 
        success: true, 
        watch: mockWatch,
        message: 'Price watch created (mock mode)! Database unavailable.'
      }, { headers })
    }
  } catch (error) {
    console.error('Watchlist creation error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Watchlist creation failed',
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