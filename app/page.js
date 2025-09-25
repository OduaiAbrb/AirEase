'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Clock, ArrowRight, Mail, Brain, CheckCircle, AlertCircle, Sparkles, Zap, Target, Settings, Filter, Camera, CreditCard, Star, Wifi, Coffee, Monitor, Shield, TrendingDown, TrendingUp } from "lucide-react"
import Link from 'next/link'
import { generateRealisticFlights } from '../lib/realisticFlightData.js'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
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

  const handleDirectSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      addNotification('Please fill in origin, destination, and departure date', 'error')
      return
    }

    setLoading(true)
    setCurrentPage('results')
    
    try {
      // Generate realistic flights using our enhanced data
      const realisticFlights = generateRealisticFlights(searchParams)
      
      setSearchResults(realisticFlights)
      addNotification(`Found ${realisticFlights.length} flights from ${searchParams.from} to ${searchParams.to}`)
    } catch (error) {
      addNotification('Search failed. Please try again.', 'error')
    }
    
    setLoading(false)
  }

  const startPreferencesDemo = () => {
    setCurrentPage('preferences')
    setPreferencesLoading(true)
    
    setTimeout(() => {
      setPreferencesLoading(false)
      
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
      
      matches.push({
        type: 'Price Match',
        requested: `Under $${searchParams.maxPrice || 600}`,
        found: `Found flights from $320`,
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
      const realisticFlights = generateRealisticFlights(searchParams)
      
      // Filter flights based on preferences
      let filteredFlights = realisticFlights
      
      if (preferences.maxStops === '0') {
        filteredFlights = filteredFlights.filter(flight => flight.stops === 0)
      }
      
      // Add match scores based on preferences
      filteredFlights = filteredFlights.map(flight => ({
        ...flight,
        matchScore: calculateMatchScore(flight, preferences),
        matchedPreferences: getMatchedPreferences(flight, preferences)
      })).sort((a, b) => b.matchScore - a.matchScore)
      
      setSearchResults(filteredFlights.slice(0, 8))
      addNotification(`Found ${filteredFlights.length} flights matching your exact preferences!`)
    } catch (error) {
      addNotification('Search failed. Please try again.', 'error')
    }
    
    setLoading(false)
  }

  const calculateMatchScore = (flight, prefs) => {
    let score = 70 // Base score
    
    if (prefs.maxStops === '0' && flight.stops === 0) score += 20
    if (prefs.preferredDepartureTime && flight.departureTime.startsWith(prefs.preferredDepartureTime.split(':')[0])) score += 10
    
    return Math.min(100, score)
  }

  const getMatchedPreferences = (flight, prefs) => {
    const matches = []
    if (prefs.maxStops === '0' && flight.stops === 0) matches.push('Direct Flight')
    if (flight.quality === 'premium') matches.push('Premium Service')
    if (flight.price <= parseInt(searchParams.maxPrice || 1000)) matches.push('Price Target')
    return matches
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

  const proceedToBooking = (flight) => {
    // Store selected flight for booking flow
    localStorage.setItem('selectedFlight', JSON.stringify(flight))
    
    // Redirect to auto-purchase with pre-filled data
    window.location.href = `/auto-purchase?flight=${flight.id}&price=${flight.price}`
  }

  const scanBoardingPass = (flight) => {
    // Store flight for boarding pass workflow
    localStorage.setItem('flightForScanning', JSON.stringify(flight))
    
    // Redirect to boarding pass scanner
    window.location.href = `/boarding-pass?flight=${flight.id}`
  }

  // HOME PAGE
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-slate-900/80"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-400/20 rounded-full animate-pulse"></div>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert 
              key={notification.id} 
              className={`max-w-md shadow-2xl border-0 ${
                notification.type === 'error' ? 'bg-red-500/90 text-white' : 
                notification.type === 'info' ? 'bg-blue-500/90 text-white' :
                'bg-green-500/90 text-white'
              }`}
            >
              {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Header */}
        <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plane className="h-6 w-6 text-white transform rotate-45" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Airease</h1>
                  <p className="text-xs text-blue-200">Smart Flight Solutions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/boarding-pass">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30">
                    <Camera className="h-4 w-4 mr-1" />
                    Scan Pass
                  </Button>
                </Link>
                <Link href="/auto-purchase">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Auto-Buy
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h2 className="text-6xl font-bold text-white mb-6 leading-tight">
                Never Miss a 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Perfect Flight</span>
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                AI-powered flight monitoring with smart price matching, automated purchasing, 
                and personalized travel recommendations. Find flights that match your exact needs.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">250K+</div>
                <div className="text-blue-200 text-sm">Flights Monitored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$2.3M</div>
                <div className="text-blue-200 text-sm">Saved by Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-blue-200 text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Enhanced Search Form */}
          <Card className="mb-12 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="AMM - Amman, Jordan"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      value={searchParams.from}
                      onChange={(e) => setSearchParams({...searchParams, from: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center pt-8">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="LHR - London, UK"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      value={searchParams.to}
                      onChange={(e) => setSearchParams({...searchParams, to: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      value={searchParams.departDate}
                      onChange={(e) => setSearchParams({...searchParams, departDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Max Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="800"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      value={searchParams.maxPrice}
                      onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleDirectSearch}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg rounded-xl shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Flights
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('preferences')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Smart Match
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Features Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Target,
                title: 'Smart Price Matching',
                description: 'AI finds flights matching your exact preferences and budget',
                color: 'from-blue-500 to-cyan-400'
              },
              {
                icon: Zap,
                title: 'Auto-Purchase',
                description: 'Automatic booking when your target prices are hit',
                color: 'from-green-500 to-emerald-400'
              },
              {
                icon: Brain,
                title: 'AI Travel Assistant',
                description: 'Personalized packing, tips, and travel recommendations',
                color: 'from-purple-500 to-pink-400'
              },
              {
                icon: Camera,
                title: 'Boarding Pass Scanner',
                description: 'OCR technology extracts flight details and creates timelines',
                color: 'from-orange-500 to-red-400'
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-md border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <div className="flex justify-center space-x-8 items-center opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white text-sm">SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white text-sm">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-white" />
                <span className="text-white text-sm">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Results Page with realistic flights
  if (currentPage === 'results') {
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

        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setCurrentPage('home')}>
                ← Back to Search
              </Button>
              <h1 className="text-xl font-bold">Flight Results</h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {searchResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchResults.length} flights found
                </h2>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {searchParams.from} → {searchParams.to}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Sorted by price
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {searchResults.map((flight, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30">
                    <CardContent className="p-6">
                      
                      {/* Price Change Indicator */}
                      {flight.priceChange && (
                        <div className="mb-4">
                          <Badge className={`${
                            flight.priceChange === 'down' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {flight.priceChange === 'down' ? 
                              <><TrendingDown className="h-3 w-3 mr-1" />Price dropped $${flight.priceChangeAmount}</> :
                              <><TrendingUp className="h-3 w-3 mr-1" />Price increased $${flight.priceChangeAmount}</>
                            }
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Airline & Flight Info */}
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl">{flight.logo}</div>
                            <div className="text-sm font-medium text-gray-700">{flight.airlineCode}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
                            <div className="text-sm text-gray-600">{flight.from}</div>
                            <div className="text-xs text-gray-500">{flight.fromCity}</div>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-px bg-gray-300"></div>
                              <Plane className="h-4 w-4 text-gray-400" />
                              <div className="w-6 h-px bg-gray-300"></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                              {flight.stopover && <div className="text-xs text-blue-600">via {flight.stopover}</div>}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
                            <div className="text-sm text-gray-600">{flight.to}</div>
                            <div className="text-xs text-gray-500">{flight.toCity}</div>
                          </div>
                          
                          <div className="text-left space-y-1">
                            <div className="font-semibold text-gray-900">{flight.airline}</div>
                            <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                            <div className="text-xs text-gray-500">{flight.aircraft}</div>
                            <Badge className={`text-xs ${
                              flight.quality === 'premium' ? 'bg-purple-100 text-purple-800' :
                              flight.quality === 'good' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {flight.quality}
                            </Badge>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center space-x-8">
                          
                          {/* Flight Details */}
                          <div className="text-sm space-y-1 text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Wifi className="h-3 w-3" />
                              <span>{flight.wifi ? 'Wi-Fi' : 'No Wi-Fi'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Coffee className="h-3 w-3" />
                              <span>{flight.meals}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Monitor className="h-3 w-3" />
                              <span>{flight.seatPitch}</span>
                            </div>
                            <div className="text-xs text-green-600">
                              {flight.availableSeats} seats left
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <div className="text-4xl font-bold text-blue-600">${flight.price}</div>
                            {flight.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">${flight.originalPrice}</div>
                            )}
                            <div className="text-sm text-gray-500">per person</div>
                            <div className="text-xs text-gray-400">
                              {flight.carbonEmission}kg CO₂
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-3">
                            <Button 
                              onClick={() => getAIRecommendations(flight)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap"
                              size="sm"
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              AI Assistant
                            </Button>
                            
                            <Button 
                              onClick={() => proceedToBooking(flight)}
                              className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                              size="sm"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Book & Pay
                            </Button>
                            
                            <Button 
                              onClick={() => scanBoardingPass(flight)}
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap"
                            >
                              <Camera className="h-4 w-4 mr-1" />
                              Scan Pass
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Match Score for preference-based searches */}
                      {flight.matchScore && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-100 text-green-800">
                              {flight.matchScore}% Match Score
                            </Badge>
                            <div className="text-sm text-gray-600">
                              Matches: {flight.matchedPreferences?.join(', ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations Panel */}
          {selectedFlight && (
            <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Sparkles className="h-6 w-6" />
                  AI Travel Assistant for {selectedFlight.fromCity} → {selectedFlight.toCity}
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
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          🌤️ Weather & Packing Guide
                        </h4>
                        <div className="mb-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            {aiRecommendations.weatherInfo.temp}°C, {aiRecommendations.weatherInfo.condition}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">👔 Essential Clothing</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {aiRecommendations.packingList.clothing.slice(0, 4).map((item, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">☔ Weather Essentials</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {aiRecommendations.packingList.weather.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-blue-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          ⏰ Smart Timeline
                        </h4>
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          Leave by: {aiRecommendations.timeManagement.leaveBy}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          Total prep time: {aiRecommendations.timeManagement.totalMinutes} minutes
                        </div>
                        
                        <div className="space-y-2">
                          {aiRecommendations.timeManagement.timeline?.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.task}</span>
                              <span className="font-medium text-orange-600">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        💡 Local Travel Tips
                      </h4>
                      <div className="space-y-4">
                        {aiRecommendations.travelTips.slice(0, 4).map((tip, idx) => (
                          <div key={idx} className="border-l-4 border-purple-400 pl-4 py-2">
                            <h5 className="text-sm font-medium text-purple-800">{tip.category}</h5>
                            <p className="text-sm text-gray-600 mt-1">{tip.tip}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">✨ Pro Tip</h5>
                        <p className="text-sm text-gray-600">
                          Download offline maps and key phrases in the local language. 
                          Consider getting travel insurance for international trips.
                        </p>
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

                <div className="mt-6 text-center">
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

  // Preferences page remains the same but with better styling
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Preferences page content similar to before but with improved styling */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => setCurrentPage('home')}>
              ← Back to Search
            </Button>
            <h1 className="text-xl font-bold">Set Your Travel Preferences</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {preferencesLoading ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-md shadow-xl">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Finding Your Perfect Matches...</h3>
              <p className="text-gray-600 text-lg">Analyzing thousands of flights for your exact preferences</p>
              <div className="w-80 mx-auto bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm text-gray-600">
                <div>✓ Checking direct flights</div>
                <div>✓ Matching departure times</div>
                <div>✓ Finding best prices</div>
                <div>✓ Analyzing seat availability</div>
              </div>
            </div>
          </Card>
        ) : matchedPreferences.length > 0 ? (
          <div className="space-y-8">
            <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-800 text-2xl">
                  <Target className="h-8 w-8" />
                  🎯 Perfect Matches Found!
                </CardTitle>
                <p className="text-green-700 text-lg">We found flights that match all your requirements</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {matchedPreferences.map((match, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{match.type}</h4>
                        <Badge className={`px-3 py-1 ${match.match === 'exact' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {match.match === 'exact' ? '💯 Perfect Match' : '⚡ Better Deal'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">You wanted: <span className="font-medium">{match.requested}</span></p>
                      <p className="text-green-700 font-semibold">✅ {match.found}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={handlePreferencesSearch}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-12 py-4 text-lg rounded-xl shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'Finding Flights...' : '✈️ View Perfect Match Flights'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl">Tell us your exact travel preferences</CardTitle>
              <p className="text-gray-600">We'll find flights that match your specific needs</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3">Preferred Landing Time</label>
                  <Select value={preferences.preferredLandingTime} onValueChange={(value) => setPreferences({...preferences, preferredLandingTime: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200">
                      <SelectValue placeholder="When do you want to land?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12:00">🌅 Noon (12:00 PM)</SelectItem>
                      <SelectItem value="17:00">🌆 Evening (5:00 PM)</SelectItem>
                      <SelectItem value="20:00">🌃 Night (8:00 PM)</SelectItem>
                      <SelectItem value="09:00">🌄 Morning (9:00 AM)</SelectItem>
                      <SelectItem value="15:00">☀️ Afternoon (3:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3">Preferred Departure Time</label>
                  <Select value={preferences.preferredDepartureTime} onValueChange={(value) => setPreferences({...preferences, preferredDepartureTime: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200">
                      <SelectValue placeholder="When do you want to depart?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">🌅 Early Morning (8:00 AM)</SelectItem>
                      <SelectItem value="12:00">☀️ Noon (12:00 PM)</SelectItem>
                      <SelectItem value="18:00">🌆 Evening (6:00 PM)</SelectItem>
                      <SelectItem value="06:00">🌄 Dawn (6:00 AM)</SelectItem>
                      <SelectItem value="22:00">🌙 Late Night (10:00 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3">Maximum Stops</label>
                  <Select value={preferences.maxStops} onValueChange={(value) => setPreferences({...preferences, maxStops: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">✈️ Direct flights only</SelectItem>
                      <SelectItem value="1">🔄 Up to 1 stop</SelectItem>
                      <SelectItem value="2">🔄🔄 Up to 2 stops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3">Seat Preference</label>
                  <Select value={preferences.seatPreference} onValueChange={(value) => setPreferences({...preferences, seatPreference: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200">
                      <SelectValue placeholder="Select seat preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Window seat">🪟 Window seat</SelectItem>
                      <SelectItem value="Aisle seat">🚶 Aisle seat</SelectItem>
                      <SelectItem value="Middle seat">📱 Middle seat</SelectItem>
                      <SelectItem value="Extra legroom">🦵 Extra legroom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={startPreferencesDemo}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-4 text-lg rounded-xl shadow-lg"
                  disabled={!preferences.preferredLandingTime && !preferences.preferredDepartureTime}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  🎯 Find My Perfect Matches
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}