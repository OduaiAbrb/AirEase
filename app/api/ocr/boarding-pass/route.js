import { NextResponse } from 'next/server'

// Mock OCR service for boarding pass extraction
async function extractBoardingPassData(imageBuffer) {
  console.log('🔍 OCR: Processing boarding pass image...')
  
  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock extraction results (in production, this would use Tesseract OCR or similar)
  const mockExtractions = [
    {
      passengerName: 'SARAH JOHNSON',
      flightNumber: 'QR456', 
      airline: 'Qatar Airways',
      from: 'AMM',
      to: 'LHR',
      date: '2025-12-20',
      departureTime: '16:45',
      gate: 'B7',
      seat: '8F',
      boardingGroup: 'Group 1',
      confidence: 92
    },
    {
      passengerName: 'MICHAEL CHEN',
      flightNumber: 'EK201',
      airline: 'Emirates',
      from: 'DXB', 
      to: 'JFK',
      date: '2025-12-18',
      departureTime: '10:30',
      gate: 'A15',
      seat: '23A',
      boardingGroup: 'Group 2', 
      confidence: 88
    },
    {
      passengerName: 'AHMAD HASSAN',
      flightNumber: 'TK789',
      airline: 'Turkish Airlines',
      from: 'IST',
      to: 'CDG', 
      date: '2025-12-22',
      departureTime: '14:20',
      gate: 'C12',
      seat: '15C',
      boardingGroup: 'Group 3',
      confidence: 85
    }
  ]
  
  // Return random mock extraction for demo
  const selectedExtraction = mockExtractions[Math.floor(Math.random() * mockExtractions.length)]
  
  console.log('✅ OCR: Extracted boarding pass data:', selectedExtraction)
  
  return selectedExtraction
}

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const formData = await request.formData()
    const file = formData.get('boardingPass')
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No boarding pass image provided' 
      }, { status: 400, headers })
    }
    
    console.log('📄 OCR: Processing boarding pass image:', file.name, file.size, 'bytes')
    
    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Extract data using OCR (mock implementation)
    const extractedData = await extractBoardingPassData(buffer)
    
    // In production, you would use a real OCR service:
    // const extractedData = await tesseractOCR.process(buffer)
    // or
    // const extractedData = await ocrSpaceAPI.extract(buffer)
    
    return NextResponse.json({
      success: true,
      extracted: extractedData,
      processingTime: '2.1s',
      ocrEngine: 'Mock OCR (Demo)',
      timestamp: new Date().toISOString()
    }, { headers })
    
  } catch (error) {
    console.error('OCR processing error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'OCR processing failed',
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