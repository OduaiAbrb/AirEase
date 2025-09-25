// Enhanced time budgeting calculations with realistic data

export function calculateTimeBudget(flightData) {
  const { from, to, departureTime, departDate } = flightData
  
  // Base travel times to airport (in minutes)
  const airportTravelTimes = {
    'JFK': 60,   // New York - varies by traffic
    'LHR': 45,   // London - Heathrow Express
    'CDG': 50,   // Paris - RER B
    'DXB': 40,   // Dubai - Metro
    'AMM': 35,   // Amman - relatively close
    'IST': 45,   // Istanbul - metro + traffic
    'FRA': 30,   // Frankfurt - efficient transport
    'AMS': 25,   // Amsterdam - very accessible
    'DOH': 25,   // Doha - compact city
    'LAX': 70,   // Los Angeles - notorious traffic
    'SFO': 50,   // San Francisco - Bay Area
    'BOM': 60,   // Mumbai - heavy traffic
    'DEL': 55,   // Delhi - metro available
    'SYD': 50,   // Sydney - airport link
  }
  
  // Get travel time to departure airport
  const travelToAirport = airportTravelTimes[from] || 45 // Default 45 minutes
  
  // International vs domestic flight buffer times
  const isInternational = isInternationalFlight(from, to)
  const checkInBuffer = isInternational ? 180 : 120 // 3 hours vs 2 hours
  const securityBuffer = 30 // Additional security/walking time
  const contingencyBuffer = 30 // Buffer for unexpected delays
  
  // Parse departure time
  const [hours, minutes] = departureTime.split(':').map(Number)
  const departureDateTime = new Date(departDate)
  departureDateTime.setHours(hours, minutes, 0, 0)
  
  // Calculate when to leave home
  const totalBufferMinutes = travelToAirport + checkInBuffer + securityBuffer + contingencyBuffer
  const leaveHomeDateTime = new Date(departureDateTime.getTime() - (totalBufferMinutes * 60 * 1000))
  
  // Generate timeline breakdown
  const timeline = generateTimeline(leaveHomeDateTime, departureDateTime, {
    travelToAirport,
    checkInBuffer,
    securityBuffer,
    contingencyBuffer,
    from
  })
  
  return {
    departureTime: formatTime(departureDateTime),
    leaveBy: formatTime(leaveHomeDateTime),
    totalMinutes: totalBufferMinutes,
    breakdown: {
      travelToAirport: `${travelToAirport} min`,
      checkIn: `${checkInBuffer} min`,
      security: `${securityBuffer} min`,
      contingency: `${contingencyBuffer} min`
    },
    timeline,
    recommendations: generateRecommendations(from, to, isInternational),
    isInternational
  }
}

function isInternationalFlight(from, to) {
  // Simplified country mapping for major airports
  const countryMap = {
    'JFK': 'US', 'LAX': 'US', 'SFO': 'US', 'ORD': 'US', 'MIA': 'US',
    'LHR': 'UK', 'CDG': 'FR', 'FRA': 'DE', 'AMS': 'NL', 'FCO': 'IT',
    'DXB': 'AE', 'DOH': 'QA', 'AMM': 'JO', 'IST': 'TR', 'CAI': 'EG',
    'BOM': 'IN', 'DEL': 'IN', 'SYD': 'AU', 'NRT': 'JP', 'SIN': 'SG'
  }
  
  const fromCountry = countryMap[from]
  const toCountry = countryMap[to]
  
  return fromCountry !== toCountry
}

function generateTimeline(leaveTime, departureTime, config) {
  const timeline = []
  let currentTime = new Date(leaveTime.getTime())
  
  // Leave home
  timeline.push({
    time: formatTime(currentTime),
    task: '🏠 Leave home',
    duration: `${config.travelToAirport} min`,
    type: 'travel'
  })
  
  // Travel to airport
  currentTime = new Date(currentTime.getTime() + config.travelToAirport * 60 * 1000)
  timeline.push({
    time: formatTime(currentTime),
    task: `✈️ Arrive at ${config.from}`,
    duration: `${config.checkInBuffer} min`,
    type: 'airport'
  })
  
  // Check-in process
  currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000) // 1 hour for check-in
  timeline.push({
    time: formatTime(currentTime),
    task: '🎫 Complete check-in',
    duration: `${config.securityBuffer} min`,
    type: 'process'
  })
  
  // Security screening
  currentTime = new Date(currentTime.getTime() + config.securityBuffer * 60 * 1000)
  timeline.push({
    time: formatTime(currentTime),
    task: '🔒 Through security',
    duration: 'Until departure',
    type: 'waiting'
  })
  
  // Final call to gate
  const gateTime = new Date(departureTime.getTime() - 30 * 60 * 1000) // 30 min before
  timeline.push({
    time: formatTime(gateTime),
    task: '🚪 Final boarding call',
    duration: '30 min',
    type: 'boarding'
  })
  
  // Departure
  timeline.push({
    time: formatTime(departureTime),
    task: '🛫 Flight departure',
    duration: 'N/A',
    type: 'departure'
  })
  
  return timeline
}

function generateRecommendations(from, to, isInternational) {
  const baseRecommendations = [
    'Check-in online 24 hours before departure',
    'Download your boarding pass to your phone',
    'Check current security wait times before leaving',
    'Bring entertainment for potential delays'
  ]
  
  if (isInternational) {
    baseRecommendations.push(
      'Ensure passport is valid for 6+ months',
      'Check visa requirements for destination',
      'Inform bank of travel plans',
      'Consider travel insurance'
    )
  }
  
  // Airport-specific recommendations
  const airportTips = {
    'JFK': 'Use AirTrain - avoid traffic congestion',
    'LHR': 'Heathrow Express is fastest from central London',
    'CDG': 'RER B connects directly to city center',
    'LAX': 'Allow extra time for notorious LA traffic',
    'AMM': 'Airport is close to city - taxi is convenient',
    'DXB': 'Dubai Metro Red Line connects to airport',
    'IST': 'New airport - allow time for metro connections'
  }
  
  if (airportTips[from]) {
    baseRecommendations.push(airportTips[from])
  }
  
  return baseRecommendations
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Export additional utility functions
export function getTrafficPrediction(from, departureDate) {
  // Simulate traffic conditions based on day/time
  const date = new Date(departureDate)
  const dayOfWeek = date.getDay() // 0 = Sunday
  const hour = date.getHours()
  
  // Rush hour logic
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  
  if (isWeekday && isRushHour) {
    return {
      condition: 'heavy',
      multiplier: 1.5,
      advice: 'Heavy traffic expected - add 50% extra travel time'
    }
  } else if (isWeekday) {
    return {
      condition: 'moderate',
      multiplier: 1.2,
      advice: 'Moderate traffic - add 20% extra travel time'
    }
  } else {
    return {
      condition: 'light',
      multiplier: 1.0,
      advice: 'Light traffic expected - normal travel time'
    }
  }
}

export function getWeatherImpact(from, departureDate) {
  // Mock weather impact assessment
  const conditions = ['clear', 'rain', 'snow', 'fog', 'storm']
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]
  
  const impacts = {
    clear: { delay: 0, advice: 'Perfect travel conditions' },
    rain: { delay: 15, advice: 'Light rain - roads may be slower' },
    snow: { delay: 45, advice: 'Snow conditions - allow significant extra time' },
    fog: { delay: 30, advice: 'Fog may cause flight delays' },
    storm: { delay: 60, advice: 'Storm warning - check flight status' }
  }
  
  return {
    condition: randomCondition,
    ...impacts[randomCondition]
  }
}