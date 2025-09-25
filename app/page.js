'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Clock, ArrowRight, Mail, Brain, CheckCircle, AlertCircle, Sparkles, Zap, Target, Settings, Filter } from "lucide-react"

export default function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'preferences', 'results'
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departDate: '',
    maxPrice: '',
    email: 'user@airease.com'
  })
  
  const [preferences, setPreferences] = useState({
    preferredLandingTime: '',
    preferredDepartureTime: '',
    maxStops: '0',
    preferredAirlines: [],
    seatPreference: '',
    mealPreference: '',
    specialNeeds: ''
  })
  
  const [searchResults, setSearchResults] = useState([])
  const [matchedPreferences, setMatchedPreferences] = useState([])
  const [loading, setLoading] = useState(false)
  const [preferencesLoading, setPreferencesLoading] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [aiRecommendations, setAIRecommendations] = useState(null)
  const [aiLoading, setAILoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const startPreferencesDemo = () => {
    setCurrentPage('preferences')
    setPreferencesLoading(true)
    
    // 8-second loading simulation
    setTimeout(() => {
      setPreferencesLoading(false)
      
      // Generate matched preferences based on user input
      const matches = []
      
      if (preferences.preferredLandingTime) {
        matches.push({
          type: 'Landing Time',
          requested: preferences.preferredLandingTime,
          found: `Flight lands at ${preferences.preferredLandingTime}`,
          match: 'exact'
        })
      }
      
      if (preferences.preferredDepartureTime) {
        matches.push({
          type: 'Departure Time',
          requested: preferences.preferredDepartureTime,
          found: `Departs at ${preferences.preferredDepartureTime}`,
          match: 'exact'
        })
      }
      
      if (preferences.maxStops === '0') {
        matches.push({
          type: 'Direct Flight',
          requested: 'No stops',
          found: 'Direct flight available',
          match: 'exact'
        })
      }
      
      if (preferences.seatPreference) {
        matches.push({
          type: 'Seat Preference',
          requested: preferences.seatPreference,
          found: `${preferences.seatPreference} available`,
          match: 'exact'
        })
      }
      
      matches.push({
        type: 'Price Match',
        requested: `Under $${searchParams.maxPrice || 600}`,
        found: `Found flights from $445`,
        match: 'better'
      })
      
      setMatchedPreferences(matches)
      addNotification('🎯 Found exact matches for your preferences!', 'success')
    }, 8000)
  }

  const handlePreferencesSearch = async () => {
    setLoading(true)
    setCurrentPage('results')
    
    try {
      // Generate preference-matched flights
      const preferenceMatchedFlights = [
        {
          id: '1',
          from: searchParams.from,
          to: searchParams.to,
          airline: 'Qatar Airways',
          flightNumber: 'QR123',
          departureTime: preferences.preferredDepartureTime || '12:00',
          arrivalTime: preferences.preferredLandingTime || '17:00',
          duration: '5h 00m',
          price: 445,
          stops: parseInt(preferences.maxStops),
          quality: 'premium',
          amenities: ['Wi-Fi', 'Entertainment', 'Meals'],
          matchScore: 100,
          matchedPreferences: ['Landing Time', 'Departure Time', 'Direct Flight', 'Price']
        },
        {
          id: '2',
          from: searchParams.from,
          to: searchParams.to,
          airline: 'Emirates',
          flightNumber: 'EK105',
          departureTime: preferences.preferredDepartureTime || '14:15',
          arrivalTime: getAdjustedTime(preferences.preferredLandingTime || '17:00', 30),
          duration: '5h 30m',
          price: 520,
          stops: parseInt(preferences.maxStops),
          quality: 'premium',
          amenities: ['Wi-Fi', 'Entertainment', 'Meals'],
          matchScore: 95,
          matchedPreferences: ['Departure Time', 'Direct Flight', 'Price']
        },
        {
          id: '3',
          from: searchParams.from,
          to: searchParams.to,
          airline: 'Turkish Airlines',
          flightNumber: 'TK123',
          departureTime: getAdjustedTime(preferences.preferredDepartureTime || '12:00', -60),
          arrivalTime: preferences.preferredLandingTime || '17:00',
          duration: '6h 15m',
          price: 380,
          stops: preferences.maxStops === '0' ? 0 : 1,
          quality: 'good',
          amenities: ['Entertainment', 'Snacks'],
          matchScore: 88,
          matchedPreferences: ['Landing Time', 'Price']
        }
      ]
      
      setSearchResults(preferenceMatchedFlights)
      addNotification(`Found ${preferenceMatchedFlights.length} flights matching your exact preferences!`)
    } catch (error) {
      addNotification('Search failed. Please try again.', 'error')
    }
    
    setLoading(false)
  }

  const getAdjustedTime = (timeStr, minutesOffset) => {
    if (!timeStr) return timeStr
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + minutesOffset
    const adjustedHours = Math.floor(totalMinutes / 60) % 24
    const adjustedMinutes = totalMinutes % 60
    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`
  }

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      addNotification('Please fill in origin, destination, and departure date', 'error')
      return
    }
    
    // Redirect to preferences page for detailed matching
    setCurrentPage('preferences')
  }

  const getAIRecommendations = async (flight) => {
    setSelectedFlight(flight)
    setAILoading(true)
    setAIRecommendations(null)
    
    try {
      const response = await fetch('/api/flights/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightData: flight })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAIRecommendations(data.recommendations)
          addNotification('AI travel assistant ready with personalized recommendations!')
        }
      }
    } catch (error) {
      addNotification('AI recommendations unavailable. Please try again.', 'error')
    }
    
    setAILoading(false)
  }

  const addToWatchlist = async (flight) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: flight.from,
          to: flight.to,
          departDate: searchParams.departDate,
          targetPrice: flight.price,
          flightId: flight.id,
          email: searchParams.email,
          preferences: preferences
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          addNotification(data.message || 'Price watch created successfully!')
        }
      }
    } catch (error) {
      addNotification('Failed to create price watch. Please try again.', 'error')
    }
  }

  const testEmail = async () => {
    try {
      addNotification('Sending test email with AI recommendations...', 'info')
      const response = await fetch('/api/notifications/test')
      if (response.ok) {
        addNotification('Test email sent! Check console for AI-enhanced content.')
      }
    } catch (error) {
      addNotification('Test email failed.', 'error')
    }
  }

  const checkPrices = async () => {
    try {
      addNotification('Running AI-enhanced price monitoring...', 'info')
      const response = await fetch('/api/flights/check-prices')
      const data = await response.json()
      
      if (response.ok && data.result) {
        addNotification(`Price check complete! Found ${data.result.matchesFound} deals from ${data.result.watchesChecked} watches.`)
      }
    } catch (error) {
      addNotification('Price check failed.', 'error')
    }
  }

  // HOME PAGE
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert 
              key={notification.id} 
              className={`max-w-md shadow-lg ${
                notification.type === 'error' ? 'border-red-200 bg-red-50' : 
                notification.type === 'info' ? 'border-blue-200 bg-blue-50' :
                'border-green-200 bg-green-50'
              }`}
            >
              {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Airease</h1>
                  <p className="text-xs text-gray-500">Smart Price Matching</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={testEmail} variant="ghost" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Test AI Email
                </Button>
                <Button onClick={checkPrices} variant="ghost" size="sm">
                  <Zap className="h-4 w-4 mr-1" />
                  AI Price Check
                </Button>
                <Link href="/boarding-pass">
                  <Button variant="ghost" size="sm">
                    <Camera className="h-4 w-4 mr-1" />
                    Scan Boarding Pass
                  </Button>
                </Link>
                <Link href="/auto-purchase">
                  <Button variant="ghost" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Auto-Purchase
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Find Flights That Match Your Exact Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Set your preferences like landing times, departure preferences, and get flights that match exactly what you want
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="AMM, JFK, LHR"
                      className="pl-10 h-12 text-base"
                      value={searchParams.from}
                      onChange={(e) => setSearchParams({...searchParams, from: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center pt-6">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="LHR, DXB, JFK"
                      className="pl-10 h-12 text-base"
                      value={searchParams.to}
                      onChange={(e) => setSearchParams({...searchParams, to: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      className="pl-10 h-12 text-base"
                      value={searchParams.departDate}
                      onChange={(e) => setSearchParams({...searchParams, departDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="600"
                      className="pl-10 h-12 text-base"
                      value={searchParams.maxPrice}
                      onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Smart Match
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <Input
                  type="email"
                  placeholder="Email for price alerts"
                  className="max-w-xs"
                  value={searchParams.email}
                  onChange={(e) => setSearchParams({...searchParams, email: e.target.value})}
                />
                <span>Get notified when exact matches are found</span>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Landing Time Match</h3>
              <p className="text-gray-600 text-sm">Find flights that land exactly when you need</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Exact Preferences</h3>
              <p className="text-gray-600 text-sm">Match your specific travel requirements</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-gray-600 text-sm">Smart travel tips and packing guides</p>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-white/80 backdrop-blur-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
              <p className="text-gray-600 text-sm">Get notified when exact matches are found</p>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // PREFERENCES PAGE  
  if (currentPage === 'preferences') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert key={notification.id} className="max-w-md shadow-lg border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setCurrentPage('home')}>← Back</Button>
              <h1 className="text-xl font-bold">Set Your Exact Preferences</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {preferencesLoading ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Settings className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold">Finding Your Exact Matches...</h3>
                <p className="text-gray-600">Analyzing thousands of flights for your preferences</p>
                <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              </div>
            </Card>
          ) : matchedPreferences.length > 0 ? (
            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Target className="h-6 w-6" />
                    Found Exact Matches for Your Needs!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {matchedPreferences.map((match, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{match.type}</h4>
                          <Badge className={match.match === 'exact' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {match.match === 'exact' ? '100% Match' : 'Better Deal'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Requested: {match.requested}</p>
                        <p className="text-sm text-green-700 font-medium">✓ {match.found}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={handlePreferencesSearch}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'View Matched Flights'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Tell us your exact needs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Landing Time</label>
                    <Select value={preferences.preferredLandingTime} onValueChange={(value) => setPreferences({...preferences, preferredLandingTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you want to land?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12:00">Noon (12:00 PM)</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Departure Time</label>
                    <Select value={preferences.preferredDepartureTime} onValueChange={(value) => setPreferences({...preferences, preferredDepartureTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you want to depart?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="12:00">Noon (12:00 PM)</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Stops</label>
                    <Select value={preferences.maxStops} onValueChange={(value) => setPreferences({...preferences, maxStops: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Direct flights only</SelectItem>
                        <SelectItem value="1">Up to 1 stop</SelectItem>
                        <SelectItem value="2">Up to 2 stops</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Seat Preference</label>
                    <Select value={preferences.seatPreference} onValueChange={(value) => setPreferences({...preferences, seatPreference: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select seat preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Window seat">Window seat</SelectItem>
                        <SelectItem value="Aisle seat">Aisle seat</SelectItem>
                        <SelectItem value="Middle seat">Middle seat</SelectItem>
                        <SelectItem value="Extra legroom">Extra legroom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={startPreferencesDemo}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!preferences.preferredLandingTime && !preferences.preferredDepartureTime}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Find Exact Matches
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // RESULTS PAGE
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Alert key={notification.id} className="max-w-md shadow-lg border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => setCurrentPage('preferences')}>← Back</Button>
            <h1 className="text-xl font-bold">Flights Matching Your Exact Needs</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchResults.length} Perfect Matches Found
              </h2>
              <Badge className="bg-green-100 text-green-800">
                {searchParams.from} → {searchParams.to}
              </Badge>
            </div>

            <div className="space-y-4">
              {searchResults.map((flight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">
                          {flight.matchScore}% Match
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Matches: {flight.matchedPreferences.join(', ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {/* Flight Info */}
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{flight.departureTime}</div>
                          <div className="text-sm text-gray-500">{flight.from}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-px bg-gray-300"></div>
                            <Plane className="h-4 w-4 text-gray-400" />
                            <div className="w-4 h-px bg-gray-300"></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-500">{flight.to}</div>
                        </div>

                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{flight.airline}</div>
                          <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600">${flight.price}</div>
                          <div className="text-sm text-gray-500">perfect match</div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button 
                            onClick={() => getAIRecommendations(flight)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap"
                            size="sm"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            AI Assistant
                          </Button>
                          
                          <Button 
                            onClick={() => addToWatchlist(flight)}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Watch Price
                          </Button>
                          
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          >
                            Book This Flight
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {selectedFlight && (
          <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Sparkles className="h-6 w-6" />
                AI Travel Assistant for {selectedFlight.from} → {selectedFlight.to}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center">
                    <Brain className="h-6 w-6 text-purple-600 animate-pulse mr-2" />
                    <span>AI is analyzing your trip and generating personalized recommendations...</span>
                  </div>
                </div>
              ) : aiRecommendations ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🌤️ Weather & Packing
                      </h4>
                      <div className="mb-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          {aiRecommendations.weatherInfo.temp}°C, {aiRecommendations.weatherInfo.condition}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">👔 Clothing</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {aiRecommendations.packingList.clothing.slice(0, 3).map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        ⏰ Time Management
                      </h4>
                      <div className="text-lg font-bold text-orange-600 mb-2">
                        Leave by: {aiRecommendations.timeManagement.leaveBy}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total travel time: {aiRecommendations.timeManagement.totalMinutes} minutes
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      💡 Local Travel Tips
                    </h4>
                    <div className="space-y-3">
                      {aiRecommendations.travelTips.slice(0, 3).map((tip, idx) => (
                        <div key={idx} className="border-l-4 border-purple-400 pl-3">
                          <h5 className="text-sm font-medium text-purple-800">{tip.category}</h5>
                          <p className="text-sm text-gray-600">{tip.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={() => getAIRecommendations(selectedFlight)}>
                    Get AI Recommendations
                  </Button>
                </div>
              )}

              <div className="mt-4 text-center">
                <Button 
                  onClick={() => setSelectedFlight(null)}
                  variant="ghost"
                  size="sm"
                >
                  Close AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}