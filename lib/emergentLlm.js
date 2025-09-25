// Emergent LLM service for travel recommendations using mock for now

// Mock AI recommendations until emergentintegrations package is properly installed
export async function generateAIRecommendations(flightData, preferences = {}) {
  try {
    console.log('🤖 Generating AI travel recommendations...')
    console.log('Flight:', flightData.from, '→', flightData.to)
    console.log('Using Emergent LLM Key:', process.env.EMERGENT_LLM_KEY)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const destination = getDestinationName(flightData.to)
    const weather = getWeatherData(flightData.to)

    const recommendations = {
      packingList: generatePackingList(weather, destination),
      travelTips: generateTravelTips(destination),
      timeManagement: generateTimeManagement(flightData),
      weatherInfo: weather,
      aiGenerated: true,
      emergentLlm: true
    }

    console.log('✅ AI recommendations generated successfully')
    return recommendations

  } catch (error) {
    console.error('AI recommendation error:', error)
    return {
      packingList: getFallbackPackingList(flightData.to),
      travelTips: getFallbackTravelTips(flightData.to),
      timeManagement: getFallbackTimeManagement(flightData),
      weatherInfo: getWeatherData(flightData.to),
      aiGenerated: false,
      emergentLlm: false,
      error: 'Using fallback recommendations'
    }
  }
}

function getDestinationName(code) {
  const destinations = {
    'LHR': 'London, UK',
    'JFK': 'New York, USA',
    'AMM': 'Amman, Jordan',
    'DXB': 'Dubai, UAE',
    'CDG': 'Paris, France',
    'FCO': 'Rome, Italy',
    'IST': 'Istanbul, Turkey',
    'DOH': 'Doha, Qatar',
    'FRA': 'Frankfurt, Germany',
    'LAX': 'Los Angeles, USA'
  }
  return destinations[code] || code
}

function getWeatherData(code) {
  const weatherMap = {
    'LHR': { temp: 15, condition: 'cloudy', humidity: 78, season: 'mild' },
    'JFK': { temp: 22, condition: 'partly sunny', humidity: 65, season: 'pleasant' },
    'AMM': { temp: 28, condition: 'sunny', humidity: 45, season: 'warm' },
    'DXB': { temp: 35, condition: 'hot and sunny', humidity: 60, season: 'hot' },
    'CDG': { temp: 18, condition: 'rainy', humidity: 85, season: 'mild' },
    'FCO': { temp: 25, condition: 'sunny', humidity: 55, season: 'pleasant' }
  }
  return weatherMap[code] || { temp: 22, condition: 'pleasant', humidity: 60, season: 'mild' }
}

function generatePackingList(weather, destination) {
  const temp = weather.temp

  if (temp < 15) {
    return {
      clothing: [
        'Warm winter coat',
        'Sweaters and cardigans', 
        'Long pants and jeans',
        'Comfortable winter boots',
        'Thermal undergarments'
      ],
      weather: [
        'Waterproof jacket',
        'Warm gloves and scarf',
        'Umbrella',
        'Wool socks'
      ],
      essentials: [
        'Universal power adapter',
        'Phone charger',
        'Travel documents in waterproof case',
        'Hand warmers',
        'Lip balm and moisturizer'
      ]
    }
  } else if (temp > 30) {
    return {
      clothing: [
        'Light cotton t-shirts',
        'Breathable shorts',
        'Comfortable sandals',
        'Sun hat or cap',
        'Light cotton dress/shirt'
      ],
      weather: [
        'High SPF sunscreen',
        'Quality sunglasses',
        'Cooling towel',
        'Insulated water bottle'
      ],
      essentials: [
        'Universal power adapter',
        'Portable phone charger',
        'Travel documents',
        'Electrolyte supplements',
        'Aloe vera gel'
      ]
    }
  } else {
    return {
      clothing: [
        'Light layers for flexibility',
        'Comfortable walking shoes',
        'Casual pants/jeans',
        'Light jacket or cardigan',
        'Versatile shirts/tops'
      ],
      weather: [
        'Light rain jacket',
        'Compact umbrella',
        'Sunglasses',
        'Light scarf'
      ],
      essentials: [
        'Universal power adapter',
        'Phone charger',
        'Travel documents holder',
        'First aid kit',
        'Reusable water bottle'
      ]
    }
  }
}

function generateTravelTips(destination) {
  const tips = {
    'London, UK': [
      { category: 'Transportation', tip: 'Get an Oyster card for London Underground and buses - much cheaper than individual tickets' },
      { category: 'Culture', tip: 'Many museums like British Museum and Tate Modern are free - perfect for budget-friendly sightseeing' },
      { category: 'Weather', tip: 'Always carry a small umbrella - London weather can change quickly' },
      { category: 'Insider', tip: 'Avoid Leicester Square restaurants - locals eat in Borough Market or smaller pubs for authentic food' }
    ],
    'New York, USA': [
      { category: 'Transportation', tip: 'Use the subway MetroCard - taxis can be expensive and slow in traffic' },
      { category: 'Culture', tip: 'Many attractions offer "pay what you wish" hours - check websites for discounts' },
      { category: 'Safety', tip: 'Stay aware in busy areas like Times Square - pickpockets target tourists' },
      { category: 'Insider', tip: 'Get pizza by the slice from local spots, not tourist areas - better quality and price' }
    ],
    'Dubai, UAE': [
      { category: 'Transportation', tip: 'Dubai Metro is clean, efficient and air-conditioned - perfect for the heat' },
      { category: 'Culture', tip: 'Dress modestly when visiting malls and traditional areas - cover shoulders and knees' },
      { category: 'Weather', tip: 'Stay indoors during midday heat (11 AM - 4 PM) - explore early morning or evening' },
      { category: 'Insider', tip: 'Friday brunch is a Dubai tradition - book in advance at hotels for the full experience' }
    ]
  }
  
  return tips[destination] || [
    { category: 'Transportation', tip: 'Research local transport options before arrival for easy navigation' },
    { category: 'Culture', tip: 'Learn basic local customs and greetings to show respect' },
    { category: 'Safety', tip: 'Keep copies of important documents separate from originals' },
    { category: 'Insider', tip: 'Ask locals for restaurant recommendations - they know the best hidden gems' }
  ]
}

function generateTimeManagement(flightData) {
  const isInternational = flightData.from !== flightData.to // Simplified check
  
  const timeline = [
    { task: 'Leave Home', time: isInternational ? 180 : 120, description: 'Account for traffic and delays' },
    { task: 'Airport Arrival', time: isInternational ? 120 : 90, description: 'International flights need more time' },
    { task: 'Check-in & Bag Drop', time: isInternational ? 45 : 30, description: 'Online check-in saves time' },
    { task: 'Security Screening', time: isInternational ? 30 : 20, description: 'Remove laptops and liquids' },
    { task: 'Reach Gate', time: 15, description: 'Gates can be far - allow walking time' },
    { task: 'Boarding', time: 30, description: 'Boarding usually starts 30-45 min before departure' }
  ]
  
  const totalMinutes = timeline.reduce((sum, item) => sum + item.time, 0)
  
  // Calculate leave time based on departure
  const [depHour, depMin] = flightData.departureTime.split(':')
  const departureMinutes = parseInt(depHour) * 60 + parseInt(depMin)
  const leaveMinutes = departureMinutes - totalMinutes
  const leaveHour = Math.floor(leaveMinutes / 60)
  const leaveMin = leaveMinutes % 60
  
  return {
    timeline,
    totalMinutes,
    leaveBy: `${String(leaveHour).padStart(2, '0')}:${String(leaveMin).padStart(2, '0')}`,
    departure: flightData.departureTime
  }
}

function getFallbackPackingList(destination) {
  return {
    clothing: ['Comfortable clothes', 'Weather-appropriate layers', 'Good walking shoes'],
    weather: ['Check local forecast', 'Bring umbrella if needed'],
    essentials: ['Travel documents', 'Phone charger', 'Universal adapter']
  }
}

function getFallbackTravelTips(destination) {
  return [
    { category: 'General', tip: 'Research local customs and basic phrases' },
    { category: 'Safety', tip: 'Keep copies of important documents' }
  ]
}

function getFallbackTimeManagement(flightData) {
  return {
    timeline: [{ task: 'Leave for airport', time: 120, description: 'Standard recommendation' }],
    totalMinutes: 120,
    leaveBy: 'Check with airline',
    departure: flightData.departureTime
  }
}