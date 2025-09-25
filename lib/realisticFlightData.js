// Comprehensive realistic flight data generator

const AIRLINES = [
  {
    code: 'QR',
    name: 'Qatar Airways',
    logo: '🇶🇦',
    quality: 'premium',
    priceMultiplier: 1.3,
    routes: ['DOH', 'LHR', 'JFK', 'CDG', 'FCO', 'AMM', 'DXB']
  },
  {
    code: 'EK',
    name: 'Emirates',
    logo: '🇦🇪',
    quality: 'premium', 
    priceMultiplier: 1.25,
    routes: ['DXB', 'LHR', 'JFK', 'CDG', 'SYD', 'BOM', 'CAI']
  },
  {
    code: 'LH',
    name: 'Lufthansa',
    logo: '🇩🇪',
    quality: 'good',
    priceMultiplier: 1.1,
    routes: ['FRA', 'MUC', 'LHR', 'JFK', 'CDG', 'AMM', 'IST']
  },
  {
    code: 'TK',
    name: 'Turkish Airlines',
    logo: '🇹🇷',
    quality: 'good',
    priceMultiplier: 0.9,
    routes: ['IST', 'LHR', 'JFK', 'CDG', 'AMM', 'DXB', 'BOM']
  },
  {
    code: 'BA',
    name: 'British Airways',
    logo: '🇬🇧',
    quality: 'good',
    priceMultiplier: 1.15,
    routes: ['LHR', 'JFK', 'LAX', 'CDG', 'AMM', 'DXB', 'BOM']
  },
  {
    code: 'AF',
    name: 'Air France',
    logo: '🇫🇷',
    quality: 'good',
    priceMultiplier: 1.1,
    routes: ['CDG', 'LHR', 'JFK', 'LAX', 'AMM', 'CAI', 'DXB']
  },
  {
    code: 'KL',
    name: 'KLM',
    logo: '🇳🇱',
    quality: 'standard',
    priceMultiplier: 0.95,
    routes: ['AMS', 'LHR', 'JFK', 'CDG', 'AMM', 'BOM', 'NRT']
  },
  {
    code: 'VS',
    name: 'Virgin Atlantic',
    logo: '🇬🇧',
    quality: 'good',
    priceMultiplier: 1.05,
    routes: ['LHR', 'JFK', 'LAX', 'MIA', 'DXB', 'BOM', 'DEL']
  }
]

const AIRPORTS = {
  // Europe
  'LHR': { city: 'London', country: 'UK', timezone: 'GMT', hub: true },
  'CDG': { city: 'Paris', country: 'France', timezone: 'CET', hub: true },
  'FRA': { city: 'Frankfurt', country: 'Germany', timezone: 'CET', hub: true },
  'AMS': { city: 'Amsterdam', country: 'Netherlands', timezone: 'CET', hub: true },
  'MUC': { city: 'Munich', country: 'Germany', timezone: 'CET', hub: false },
  'FCO': { city: 'Rome', country: 'Italy', timezone: 'CET', hub: false },
  
  // Middle East
  'DXB': { city: 'Dubai', country: 'UAE', timezone: 'GST', hub: true },
  'DOH': { city: 'Doha', country: 'Qatar', timezone: 'AST', hub: true },
  'AMM': { city: 'Amman', country: 'Jordan', timezone: 'EET', hub: false },
  'IST': { city: 'Istanbul', country: 'Turkey', timezone: 'TRT', hub: true },
  'CAI': { city: 'Cairo', country: 'Egypt', timezone: 'EET', hub: false },
  
  // North America
  'JFK': { city: 'New York', country: 'USA', timezone: 'EST', hub: true },
  'LAX': { city: 'Los Angeles', country: 'USA', timezone: 'PST', hub: true },
  'MIA': { city: 'Miami', country: 'USA', timezone: 'EST', hub: false },
  'ORD': { city: 'Chicago', country: 'USA', timezone: 'CST', hub: true },
  'SFO': { city: 'San Francisco', country: 'USA', timezone: 'PST', hub: false },
  
  // Asia & Others
  'BOM': { city: 'Mumbai', country: 'India', timezone: 'IST', hub: true },
  'DEL': { city: 'Delhi', country: 'India', timezone: 'IST', hub: true },
  'SYD': { city: 'Sydney', country: 'Australia', timezone: 'AEST', hub: true },
  'NRT': { city: 'Tokyo', country: 'Japan', timezone: 'JST', hub: true },
  'SIN': { city: 'Singapore', country: 'Singapore', timezone: 'SGT', hub: true }
}

// Real-world base prices for common routes (in USD)
const ROUTE_PRICES = {
  'AMM-LHR': 420,
  'LHR-AMM': 380,
  'AMM-JFK': 650,
  'JFK-AMM': 590,
  'LHR-JFK': 480,
  'JFK-LHR': 450,
  'AMM-DXB': 180,
  'DXB-AMM': 170,
  'LHR-CDG': 120,
  'CDG-LHR': 110,
  'JFK-LAX': 320,
  'LAX-JFK': 290,
  'DXB-LHR': 550,
  'LHR-DXB': 600,
  'IST-LHR': 280,
  'LHR-IST': 260,
  'AMM-IST': 150,
  'IST-AMM': 140,
  'DXB-JFK': 780,
  'JFK-DXB': 720,
  'BOM-LHR': 520,
  'LHR-BOM': 580
}

export function generateRealisticFlights(searchParams) {
  console.log('🔍 Generating realistic flights for:', searchParams)
  
  const { from, to, departDate, maxPrice } = searchParams
  const routeKey = `${from}-${to}`
  const reverseRouteKey = `${to}-${from}`
  
  // Get base price for this route
  let basePrice = ROUTE_PRICES[routeKey] || ROUTE_PRICES[reverseRouteKey] || 400
  
  // Apply seasonal adjustments
  const month = new Date(departDate).getMonth()
  const isHighSeason = [5, 6, 7, 11].includes(month) // Jun, Jul, Aug, Dec
  if (isHighSeason) basePrice *= 1.3
  
  // Find airlines that serve this route
  const availableAirlines = AIRLINES.filter(airline => 
    airline.routes.includes(from) && airline.routes.includes(to)
  )
  
  if (availableAirlines.length === 0) {
    // If no direct routes found, use major carriers
    availableAirlines.push(AIRLINES[0], AIRLINES[1], AIRLINES[2])
  }
  
  const flights = []
  const maxPriceNum = parseInt(maxPrice) || 1000
  
  // Generate flights for each available airline
  for (const airline of availableAirlines.slice(0, 8)) {
    // Generate 1-2 flights per airline
    const flightCount = Math.random() > 0.6 ? 2 : 1
    
    for (let i = 0; i < flightCount; i++) {
      const flight = generateSingleFlight(airline, from, to, basePrice, departDate, i)
      
      // Only include flights within price range
      if (flight.price <= maxPriceNum) {
        flights.push(flight)
      }
    }
  }
  
  // Sort by price and limit to 12 flights
  return flights.sort((a, b) => a.price - b.price).slice(0, 12)
}

function generateSingleFlight(airline, from, to, basePrice, departDate, index) {
  const flightDate = new Date(departDate)
  
  // Generate realistic flight times
  const departureHour = 6 + (index * 4) + Math.floor(Math.random() * 3)
  const departureMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]
  
  // Calculate flight duration based on route distance
  const flightDuration = calculateFlightDuration(from, to)
  const arrivalTime = new Date(flightDate)
  arrivalTime.setHours(departureHour + Math.floor(flightDuration / 60))
  arrivalTime.setMinutes(departureMinute + (flightDuration % 60))
  
  // Calculate realistic price with variations
  const priceVariation = (Math.random() - 0.5) * 0.4 // ±20% variation
  const airlinePriceMultiplier = airline.priceMultiplier + priceVariation
  const finalPrice = Math.round(basePrice * airlinePriceMultiplier)
  
  // Determine if flight has stops
  const isDirectRoute = isDirectConnection(from, to, airline)
  const stops = isDirectRoute ? 0 : (Math.random() > 0.7 ? 1 : 0)
  
  // Add time for connections
  const totalDuration = stops > 0 ? flightDuration + 90 + Math.floor(Math.random() * 60) : flightDuration
  
  return {
    id: `${airline.code}${Math.floor(Math.random() * 999) + 100}_${Date.now()}`,
    airline: airline.name,
    airlineCode: airline.code,
    logo: airline.logo,
    flightNumber: `${airline.code}${Math.floor(Math.random() * 999) + 100}`,
    from,
    to,
    fromCity: AIRPORTS[from]?.city || from,
    toCity: AIRPORTS[to]?.city || to,
    departureTime: `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`,
    arrivalTime: formatTime(arrivalTime),
    duration: formatDuration(totalDuration),
    price: finalPrice,
    originalPrice: stops > 0 ? finalPrice + 50 : null,
    stops,
    stopover: stops > 0 ? getStopoverCity(from, to, airline) : null,
    quality: airline.quality,
    aircraft: getAircraftType(from, to),
    amenities: getAmenities(airline.quality),
    baggage: getBaggageInfo(airline.quality),
    seatPitch: getSeatPitch(airline.quality),
    wifi: airline.quality !== 'budget',
    meals: airline.quality === 'premium' ? 'Included' : airline.quality === 'good' ? 'Available' : 'For Purchase',
    onTimePerformance: Math.floor(Math.random() * 20) + 75, // 75-95%
    carbonEmission: Math.floor((totalDuration / 60) * 0.2 * 1000), // kg CO2
    bookingClass: 'Economy',
    availableSeats: Math.floor(Math.random() * 50) + 5,
    priceChange: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : null,
    priceChangeAmount: Math.floor(Math.random() * 50) + 10
  }
}

function calculateFlightDuration(from, to) {
  // Approximate flight durations in minutes based on real routes
  const durations = {
    'AMM-LHR': 330, 'LHR-AMM': 360,
    'AMM-JFK': 720, 'JFK-AMM': 660,
    'LHR-JFK': 480, 'JFK-LHR': 420,
    'AMM-DXB': 180, 'DXB-AMM': 180,
    'LHR-CDG': 80, 'CDG-LHR': 80,
    'JFK-LAX': 360, 'LAX-JFK': 300,
    'DXB-LHR': 420, 'LHR-DXB': 480,
    'IST-LHR': 240, 'LHR-IST': 260,
    'AMM-IST': 90, 'IST-AMM': 90,
    'DXB-JFK': 840, 'JFK-DXB': 780,
    'BOM-LHR': 540, 'LHR-BOM': 600
  }
  
  const routeKey = `${from}-${to}`
  const reverseKey = `${to}-${from}`
  
  return durations[routeKey] || durations[reverseKey] || 300
}

function isDirectConnection(from, to, airline) {
  // Major hubs typically offer direct flights
  const fromHub = AIRPORTS[from]?.hub
  const toHub = AIRPORTS[to]?.hub
  const airlineHubs = airline.routes
  
  return (fromHub && toHub) || 
         (airlineHubs.includes(from) && airlineHubs.includes(to))
}

function getStopoverCity(from, to, airline) {
  // Return realistic stopover cities based on airline hubs
  const hubs = {
    'QR': 'DOH',
    'EK': 'DXB', 
    'TK': 'IST',
    'LH': 'FRA',
    'AF': 'CDG',
    'KL': 'AMS',
    'BA': 'LHR'
  }
  
  const hub = hubs[airline.code]
  if (hub && hub !== from && hub !== to) {
    return AIRPORTS[hub]?.city || hub
  }
  
  return 'Frankfurt'
}

function getAircraftType(from, to) {
  const duration = calculateFlightDuration(from, to)
  
  if (duration > 480) return 'Boeing 777-300ER' // Long-haul
  if (duration > 240) return 'Airbus A350-900'  // Medium-haul
  return 'Airbus A320'  // Short-haul
}

function getAmenities(quality) {
  const amenities = {
    premium: ['Wi-Fi', 'Premium Entertainment', 'Gourmet Meals', 'Priority Boarding', 'Extra Legroom', 'Power Outlets'],
    good: ['Wi-Fi', 'Entertainment System', 'Meals', 'Standard Boarding', 'Power Outlets'],
    standard: ['Entertainment', 'Snacks', 'Standard Boarding'],
    budget: ['Basic Service']
  }
  
  return amenities[quality] || amenities.standard
}

function getBaggageInfo(quality) {
  const baggage = {
    premium: '2 checked bags (32kg each) + carry-on',
    good: '1 checked bag (23kg) + carry-on', 
    standard: '1 checked bag (20kg) + carry-on',
    budget: 'Carry-on only (7kg)'
  }
  
  return baggage[quality] || baggage.standard
}

function getSeatPitch(quality) {
  const pitches = {
    premium: '34-36 inches',
    good: '31-33 inches',
    standard: '30-31 inches',
    budget: '28-30 inches'
  }
  
  return pitches[quality] || pitches.standard
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const nextDay = date.getDate() > new Date().getDate() ? '+1' : ''
  return `${hours}:${minutes}${nextDay}`
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}