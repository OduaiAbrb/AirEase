'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Clock, ArrowRight, Mail, Brain, CheckCircle, AlertCircle, Sparkles, Zap } from "lucide-react"

export default function App() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departDate: '',
    maxPrice: '',
    email: 'user@airease.com'
  })
  
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
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

  const handleSearch = async () => {
    console.log('🔍 Search button clicked!', searchParams)
    
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      console.warn('Missing required fields:', { from: searchParams.from, to: searchParams.to, date: searchParams.departDate })
      addNotification('Please fill in origin, destination, and departure date', 'error')
      return
    }

    setLoading(true)
    setSearchResults([])
    
    try {
      console.log('🔍 Making API call to /api/flights/search...')
      
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(searchParams)
      })
      
      console.log('📡 API response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`API error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Flight search successful:', data)
      
      if (data.success && data.flights && data.flights.length > 0) {
        setSearchResults(data.flights)
        addNotification(`Found ${data.flights.length} flights from ${searchParams.from} to ${searchParams.to}`)
        console.log('✈️ Flights loaded:', data.flights.length)
      } else {
        console.warn('No flights in response:', data)
        addNotification('No flights found. Try different dates or destinations.', 'error')
      }
    } catch (error) {
      console.error('❌ Search failed with error:', error)
      addNotification(`Search failed: ${error.message}`, 'error')
    } finally {
      setLoading(false)
      console.log('🏁 Search process completed')
    }
  }

  const getAIRecommendations = async (flight) => {
    setSelectedFlight(flight)
    setAILoading(true)
    setAIRecommendations(null)
    
    try {
      console.log('🤖 Getting AI recommendations for flight:', flight.flightNumber)
      
      const response = await fetch('/api/flights/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightData: flight })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get AI recommendations')
      }
      
      const data = await response.json()
      console.log('✨ AI recommendations received:', data)
      
      if (data.success) {
        setAIRecommendations(data.recommendations)
        addNotification('AI travel assistant ready with personalized recommendations!')
      }
    } catch (error) {
      console.error('AI recommendations failed:', error)
      addNotification('AI recommendations unavailable. Please try again.', 'error')
    }
    
    setAILoading(false)
  }

  const addToWatchlist = async (flight) => {
    try {
      console.log('📝 Adding to watchlist:', flight.flightNumber)
      
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: flight.from,
          to: flight.to,
          departDate: searchParams.departDate,
          targetPrice: flight.price,
          flightId: flight.id,
          email: searchParams.email
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create watchlist')
      }
      
      const data = await response.json()
      console.log('✅ Watchlist created:', data)
      
      if (data.success) {
        addNotification(data.message || 'Price watch created successfully!')
      }
    } catch (error) {
      console.error('Watchlist creation failed:', error)
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
                <p className="text-xs text-gray-500">AI-Powered Flight Assistant</p>
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
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
                    placeholder="500"
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
                  {loading ? (
                    'Searching...'
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
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
              <span>Get AI-enhanced notifications when prices drop</span>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchResults.length} flights found
              </h2>
              <Badge className="bg-blue-100 text-blue-800">
                {searchParams.from} → {searchParams.to}
              </Badge>
            </div>

            <div className="space-y-3">
              {searchResults.map((flight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
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
                            {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-500">{flight.to}</div>
                        </div>

                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{flight.airline}</div>
                          <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                          <Badge className={`text-xs mt-1 ${
                            flight.quality === 'premium' ? 'bg-purple-100 text-purple-800' :
                            flight.quality === 'good' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {flight.quality}
                          </Badge>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">${flight.price}</div>
                          <div className="text-sm text-gray-500">per person</div>
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
                            Select Flight
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
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
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
                  {/* Weather & Packing */}
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
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">☔ Weather Items</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {aiRecommendations.packingList.weather.slice(0, 2).map((item, idx) => (
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

                  {/* Travel Tips */}
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

        {/* Empty State */}
        {searchResults.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Perfect Flight</h3>
              <p className="text-gray-500 mb-4">Search flights and get AI-powered travel recommendations</p>
              <div className="flex justify-center space-x-4 text-sm text-gray-400">
                <span>• Smart packing lists</span>
                <span>• Local travel tips</span>
                <span>• Time management</span>
                <span>• Price alerts</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}