'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Star, Mail, ArrowRight, Clock } from "lucide-react"

export default function App() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departDate: '',
    maxPrice: '',
    email: 'user@example.com'
  })
  
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [watchlists, setWatchlists] = useState([])

  const handleSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      alert('Please fill in origin, destination, and departure date')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Flight search response:', data)
      setSearchResults(data.flights || [])
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please try again.')
    }
    setLoading(false)
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
          email: searchParams.email
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        alert('Price watch created! You\'ll receive email alerts when the price drops.')
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      alert('Failed to create price watch. Please try again.')
    }
  }

  const testEmail = async () => {
    try {
      const response = await fetch('/api/notifications/test')
      if (response.ok) {
        alert('Test email sent! Check console for details.')
      }
    } catch (error) {
      console.error('Test email failed:', error)
      alert('Test email failed.')
    }
  }

  const checkPrices = async () => {
    try {
      const response = await fetch('/api/flights/check-prices')
      if (response.ok) {
        alert('Price check completed!')
      }
    } catch (error) {
      console.error('Price check failed:', error)
      alert('Price check failed.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Google Flights style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Airease</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={testEmail} variant="ghost" size="sm">
                Test Email
              </Button>
              <Button onClick={checkPrices} variant="ghost" size="sm">
                Check Prices
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Search Form - Google Flights inspired */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Where from?"
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
                    placeholder="Where to?"
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
                    placeholder="Budget"
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
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
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

            {/* Email for notifications */}
            <div className="flex items-center space-x-4">
              <Mail className="h-4 w-4 text-gray-500" />
              <Input
                type="email"
                placeholder="Email for price alerts"
                className="max-w-xs"
                value={searchParams.email}
                onChange={(e) => setSearchParams({...searchParams, email: e.target.value})}
              />
              <span className="text-sm text-gray-500">Get notified when prices drop</span>
            </div>
          </div>
        </div>

        {/* Search Results - Google Flights style */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchResults.length} flights found
              </h2>
              <span className="text-sm text-gray-500">
                {searchParams.from} → {searchParams.to}
              </span>
            </div>

            <div className="space-y-2">
              {searchResults.map((flight, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    {/* Flight Info */}
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{flight.departureTime}</div>
                        <div className="text-sm text-gray-500">{flight.from}</div>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-px bg-gray-300"></div>
                          <Plane className="h-3 w-3 text-gray-400" />
                          <div className="w-3 h-px bg-gray-300"></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{flight.arrivalTime}</div>
                        <div className="text-sm text-gray-500">{flight.to}</div>
                      </div>

                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
                        <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${flight.price}</div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>

                      <div className="flex flex-col space-y-2">
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
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                        >
                          Select Flight
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !loading && (
          <div className="text-center py-12">
            <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find your perfect flight</h3>
            <p className="text-gray-500">Enter your travel details above to get started</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Price Alerts</h3>
            <p className="text-gray-600 text-sm">Get notified when flight prices drop to your target</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Monitoring</h3>
            <p className="text-gray-600 text-sm">Continuous price tracking across airlines</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Best Deals</h3>
            <p className="text-gray-600 text-sm">Never miss the perfect flight deal again</p>
          </div>
        </div>
      </div>
    </div>
  )
}