'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Clock, Bell, Heart, Star, Mail, CheckCircle, PlayCircle, PauseCircle, Trash2 } from "lucide-react"

export default function App() {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    maxPrice: ''
  })
  
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [watchlists, setWatchlists] = useState([])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      })
      const data = await response.json()
      setSearchResults(data.flights || [])
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  const addToWatchlist = async (flight) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchParams,
          targetPrice: flight.price,
          flightId: flight.id
        })
      })
      const data = await response.json()
      if (data.success) {
        setWatchlists([...watchlists, data.watch])
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Airease
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Bell className="h-3 w-3 mr-1" />
                {watchlists.length} Watches Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Never Miss a Flight Deal Again
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor flight prices continuously, get notified when prices drop, and auto-purchase at your target price
          </p>
        </div>

        {/* Flight Search */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Monitor Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-6 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="AMM, JFK, LHR"
                    className="pl-10"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="LHR, JFK, AMM"
                    className="pl-10"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Departure</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="date"
                    className="pl-10"
                    value={searchParams.departDate}
                    onChange={(e) => setSearchParams({...searchParams, departDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="date"
                    className="pl-10"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Max Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number"
                    placeholder="500"
                    className="pl-10"
                    value={searchParams.maxPrice}
                    onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? 'Searching...' : 'Search Flights'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Available Flights</h3>
            <div className="grid gap-4">
              {searchResults.map((flight, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{flight.departureTime}</div>
                          <div className="text-sm text-gray-600">{flight.from}</div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <div className="w-8 h-px bg-gray-300"></div>
                            <Plane className="h-4 w-4" />
                            <div className="w-8 h-px bg-gray-300"></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{flight.duration}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-600">{flight.to}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">${flight.price}</div>
                        <div className="text-sm text-gray-600">{flight.airline}</div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button 
                          onClick={() => addToWatchlist(flight)}
                          variant="outline"
                          size="sm"
                          className="border-blue-200 hover:bg-blue-50"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Watch Price
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Watchlists */}
        {watchlists.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Your Price Watches
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {watchlists.map((watch, index) => (
                <Card key={index} className="shadow-md border-0 bg-gradient-to-br from-green-50 to-blue-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{watch.from} → {watch.to}</h4>
                        <p className="text-sm text-gray-600">{watch.departDate}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Target: ${watch.targetPrice}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Monitoring every hour
                      </div>
                      <Button size="sm" variant="ghost">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Notifications</h3>
            <p className="text-gray-600">Get instant email alerts when your target price is hit</p>
          </Card>
          
          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Time Budgeting</h3>
            <p className="text-gray-600">Calculate exact departure times from your location</p>
          </Card>
          
          <Card className="text-center p-6 border-0 bg-white/60 backdrop-blur-sm">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Packing</h3>
            <p className="text-gray-600">Get personalized packing recommendations</p>
          </Card>
        </div>
      </div>
    </div>
  )
}