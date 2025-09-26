import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyB3qwx3XnMLfwx43kPMp592HbQXQjbQdAY')

// Get weather data for destination
async function getDestinationWeather(cityCode, travelDate) {
  try {
    // Mock weather data for demo (in production, use Open-Meteo API)
    const mockWeatherData = {
      'LHR': { temp: 12, condition: 'partly cloudy', humidity: 78, windSpeed: 15, season: 'winter' },
      'JFK': { temp: 18, condition: 'sunny', humidity: 65, windSpeed: 10, season: 'spring' },
      'AMM': { temp: 25, condition: 'sunny', humidity: 45, windSpeed: 8, season: 'spring' },
      'DXB': { temp: 32, condition: 'hot and sunny', humidity: 55, windSpeed: 12, season: 'hot' },
      'CDG': { temp: 15, condition: 'rainy', humidity: 85, windSpeed: 18, season: 'spring' },
      'FCO': { temp: 22, condition: 'mild and sunny', humidity: 60, windSpeed: 8, season: 'pleasant' }
    }
    
    const weather = mockWeatherData[cityCode] || { temp: 20, condition: 'pleasant', humidity: 60, windSpeed: 10, season: 'mild' }
    
    console.log(`🌤️ Weather for ${cityCode}: ${weather.temp}°C, ${weather.condition}`)
    return weather
    
  } catch (error) {
    console.error('Weather fetch error:', error)
    return { temp: 20, condition: 'pleasant', humidity: 60, windSpeed: 10, season: 'mild' }
  }
}

// Generate AI-powered packing recommendations using Gemini
export async function generatePackingRecommendations(flightData, tripDetails = {}) {
  try {
    // Get weather data for destination
    const weather = await getDestinationWeather(flightData.to, flightData.departureTime)
    
    const prompt = `As an expert travel advisor, create personalized packing recommendations for a traveler.

TRIP DETAILS:
- Destination: ${flightData.to} (${getDestinationName(flightData.to)})
- Departure: ${flightData.from} (${getDestinationName(flightData.from)}) 
- Flight: ${flightData.airline} ${flightData.flightNumber}
- Weather: ${weather.temp}°C, ${weather.condition}
- Season: ${weather.season}
- Trip Type: ${tripDetails.tripType || 'leisure'}
- Duration: ${tripDetails.duration || '3-5 days'}

Please provide:
1. Essential clothing items (3-4 items)
2. Weather-specific items (2-3 items)  
3. Travel essentials (3-4 items)
4. One special tip for this destination

Keep recommendations practical and concise. Format as a JSON object with categories: "clothing", "weather", "essentials", "tip".`

    console.log('🤖 Generating AI recommendations with Google Gemini...')
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()
    
    console.log('🎯 Gemini AI Response received:', aiResponse)

    // Parse AI response
    let recommendations
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.warn('Gemini response parsing failed, using fallback recommendations')
      recommendations = getFallbackRecommendations(weather, flightData.to)
    }

    return {
      success: true,
      recommendations,
      weather,
      aiGenerated: true,
      geminiAI: true,
      destination: getDestinationName(flightData.to)
    }

  } catch (error) {
    console.error('Gemini AI recommendation error:', error)
    
    // Fallback to rule-based recommendations
    const weather = await getDestinationWeather(flightData.to, flightData.departureTime)
    const fallbackRecs = getFallbackRecommendations(weather, flightData.to)
    
    return {
      success: true,
      recommendations: fallbackRecs,
      weather,
      aiGenerated: false,
      geminiAI: false,
      destination: getDestinationName(flightData.to),
      note: 'Using smart fallback recommendations'
    }
  }
}

// Generate travel tips and destination insights using Gemini
export async function generateTravelTips(flightData, tripDetails = {}) {
  try {
    const weather = await getDestinationWeather(flightData.to, flightData.departureTime)
    
    const prompt = `As a travel expert, provide helpful travel tips for someone flying to ${getDestinationName(flightData.to)} (${flightData.to}).

CONTEXT:
- Flying from ${getDestinationName(flightData.from)}
- Current weather: ${weather.temp}°C, ${weather.condition}
- Flight: ${flightData.airline} ${flightData.flightNumber}

Provide 3-4 practical travel tips covering:
1. Local customs or etiquette
2. Best transportation from airport
3. Weather-related advice
4. One insider tip locals know

Keep tips concise and actionable. Format as JSON array of tip objects with "category" and "tip" fields.`

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    let tips
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        tips = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON array found in response')
      }
    } catch (parseError) {
      tips = getFallbackTravelTips(flightData.to)
    }

    return {
      success: true,
      tips,
      destination: getDestinationName(flightData.to),
      aiGenerated: true,
      geminiAI: true
    }

  } catch (error) {
    console.error('Gemini travel tips generation error:', error)
    return {
      success: true,
      tips: getFallbackTravelTips(flightData.to),
      destination: getDestinationName(flightData.to),
      aiGenerated: false,
      geminiAI: false
    }
  }
}

// Time budgeting with Gemini-enhanced calculations
export async function calculateTimeBudget(flightData, userLocation = null) {
  try {
    const prompt = `Calculate realistic time budget for air travel from home to being seated on the plane.

FLIGHT DETAILS:
- Departure Airport: ${flightData.from} (${getDestinationName(flightData.from)})
- Flight: ${flightData.airline} ${flightData.flightNumber} 
- Departure Time: ${flightData.departureTime}
- International: ${isInternationalFlight(flightData.from, flightData.to)}

Provide time estimates in minutes for:
1. Travel to airport (assume city center)
2. Check-in process
3. Security screening  
4. Airport navigation/gate walk
5. Boarding process

Consider airline type, international vs domestic, and typical airport procedures.
Format as JSON with "segments" array containing objects with "name" and "minutes" fields, and "totalMinutes" number.`

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    let timeBudget
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        timeBudget = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      timeBudget = getFallbackTimeBudget(flightData)
    }

    // Calculate leave-by time
    const departureTime = new Date(`2025-01-01T${flightData.departureTime}:00`)
    const leaveByTime = new Date(departureTime.getTime() - (timeBudget.totalMinutes * 60000))
    
    return {
      success: true,
      timeBudget: timeBudget.segments || timeBudget.timeBudget || [],
      totalMinutes: timeBudget.totalMinutes,
      leaveByTime: leaveByTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      aiGenerated: true,
      geminiAI: true
    }

  } catch (error) {
    console.error('Gemini time budget calculation error:', error)
    return getFallbackTimeBudget(flightData)
  }
}

// Helper functions
function getDestinationName(code) {
  const destinations = {
    'LHR': 'London, UK',
    'JFK': 'New York, USA', 
    'AMM': 'Amman, Jordan',
    'DXB': 'Dubai, UAE',
    'CDG': 'Paris, France',
    'FCO': 'Rome, Italy',
    'IST': 'Istanbul, Turkey',
    'DOH': 'Doha, Qatar'
  }
  return destinations[code] || code
}

function isInternationalFlight(from, to) {
  const countries = {
    'LHR': 'UK', 'JFK': 'US', 'AMM': 'JO', 'DXB': 'AE', 
    'CDG': 'FR', 'FCO': 'IT', 'IST': 'TR', 'DOH': 'QA'
  }
  return countries[from] !== countries[to]
}

function getFallbackRecommendations(weather, destination) {
  const temp = weather.temp
  return {
    clothing: temp < 15 
      ? ["Warm jacket", "Long pants", "Comfortable walking shoes", "Layers for temperature changes"]
      : temp > 25
      ? ["Light cotton shirts", "Shorts", "Sandals", "Sun hat"]  
      : ["Light jacket", "Comfortable jeans", "Sneakers", "Versatile layers"],
    weather: temp < 15
      ? ["Waterproof jacket", "Warm scarf", "Gloves"]
      : temp > 25
      ? ["Sunscreen SPF 30+", "Sunglasses", "Light umbrella"]
      : ["Light rain jacket", "Comfortable umbrella", "Layered clothing"],
    essentials: ["Travel adapter", "Phone charger", "Travel documents", "First aid kit", "Hand sanitizer"],
    tip: `For ${getDestinationName(destination)}: Check local customs and have small bills for tips and local transport.`
  }
}

function getFallbackTravelTips(destination) {
  return [
    { category: "Transportation", tip: "Pre-book airport transfers or check public transport options to city center" },
    { category: "Weather", tip: "Check weather forecast and pack accordingly for temperature changes" },
    { category: "Local Customs", tip: "Research basic local etiquette and greeting customs" },
    { category: "Insider Tip", tip: "Download offline maps and translation apps before arrival" }
  ]
}

function getFallbackTimeBudget(flightData) {
  const isIntl = isInternationalFlight(flightData.from, flightData.to)
  const segments = [
    { name: "Travel to Airport", minutes: 45 },
    { name: "Check-in", minutes: isIntl ? 60 : 30 },
    { name: "Security", minutes: isIntl ? 45 : 30 },
    { name: "Airport Navigation", minutes: 15 },
    { name: "Boarding", minutes: 30 }
  ]
  
  const totalMinutes = segments.reduce((sum, seg) => sum + seg.minutes, 0)
  const departureTime = new Date(`2025-01-01T${flightData.departureTime}:00`)
  const leaveByTime = new Date(departureTime.getTime() - (totalMinutes * 60000))
  
  return {
    success: true,
    timeBudget: segments,
    totalMinutes,
    leaveByTime: leaveByTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    aiGenerated: false,
    geminiAI: false
  }
}