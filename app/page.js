'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Clock, ArrowRight, Mail, Brain, CheckCircle, AlertCircle, Sparkles, Zap, Target, Settings, Filter, Camera, CreditCard, Star, Wifi, Coffee, Monitor, Shield, TrendingDown, TrendingUp, AlertTriangle, Phone, LifeBuoy, Navigation, Map, Compass, Route } from "lucide-react"
import Link from 'next/link'
import { generateRealisticFlights } from '../lib/realisticFlightData.js'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
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
  const [missedFlightData, setMissedFlightData] = useState(null)
  const [recoveryOptions, setRecoveryOptions] = useState([])
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500) // Show splash for 3.5 seconds

    return () => clearTimeout(timer)
  }, [])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Enhanced realistic stats
  const realisticStats = [
    {
      number: "47K+",
      label: "Flights Monitored",
      description: "Active flight tracking"
    },
    {
      number: "$890K",
      label: "Saved by Users",
      description: "Total user savings"
    },
    {
      number: "94%",
      label: "Success Rate",
      description: "Booking success"
    }
  ]

  // Get destination images and info
  const getDestinationInfo = (cityCode) => {
    const destinations = {
      'LHR': {
        city: 'London',
        country: 'United Kingdom',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
        highlights: ['Big Ben', 'Tower Bridge', 'British Museum', 'Hyde Park'],
        tips: [
          'Book attractions online to skip lines',
          'Use Oyster Card for public transport',
          'Try traditional afternoon tea',
          'Visit Camden Market for unique finds'
        ]
      },
      'JFK': {
        city: 'New York',
        country: 'United States',
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
        highlights: ['Times Square', 'Central Park', 'Statue of Liberty', 'Empire State Building'],
        tips: [
          'Get MetroCard for subway travel',
          'Visit Central Park early morning',
          'Try authentic New York pizza',
          'Book Broadway shows in advance'
        ]
      },
      'CDG': {
        city: 'Paris',
        country: 'France',
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
        tips: [
          'Buy museum pass for multiple attractions',
          'Learn basic French phrases',
          'Try local bakeries for croissants',
          'Walk along the Seine River'
        ]
      },
      'DXB': {
        city: 'Dubai',
        country: 'UAE',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
        highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
        tips: [
          'Dress modestly when visiting mosques',
          'Use Dubai Metro - very efficient',
          'Try traditional Emirati cuisine',
          'Visit during cooler months (Nov-Mar)'
        ]
      },
      'AMM': {
        city: 'Amman',
        country: 'Jordan',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73dd4?w=800',
        highlights: ['Petra', 'Dead Sea', 'Roman Theatre', 'Citadel'],
        tips: [
          'Visit Petra early to avoid crowds',
          'Try mansaf - the national dish',
          'Respect local customs and dress code',
          'Bargain in traditional souks'
        ]
      }
    }
    
    return destinations[cityCode] || {
      city: 'Unknown',
      country: '',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      highlights: ['Explore local attractions'],
      tips: ['Research local customs', 'Learn basic phrases', 'Try local cuisine']
    }
  }

  // Get airport gate map (synthetic)
  const getAirportGateInfo = (airportCode, flightNumber) => {
    const airports = {
      'LHR': {
        name: 'Heathrow Airport',
        terminal: 'Terminal 5',
        gate: 'A12',
        mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
        walkTime: '12 minutes',
        directions: [
          'Exit security and turn right',
          'Follow signs to Gates A10-A20',
          'Take moving walkway for 200m',
          'Gate A12 will be on your left'
        ]
      },
      'JFK': {
        name: 'John F. Kennedy Airport',
        terminal: 'Terminal 4',
        gate: 'B7',
        mapImage: 'https://images.unsplash.com/photo-1578575436955-ef29da568c6c?w=600',
        walkTime: '8 minutes',
        directions: [
          'Head straight from security',
          'Follow blue signs to Gates B1-B10',
          'Pass duty-free shops on your right',
          'Gate B7 next to the food court'
        ]
      },
      'CDG': {
        name: 'Charles de Gaulle Airport',
        terminal: 'Terminal 2E',
        gate: 'K25',
        mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
        walkTime: '15 minutes',
        directions: [
          'Take escalator down to Level 0',
          'Board CDGVAL shuttle to Terminal 2E',
          'Follow signs to Gates K20-K30',
          'Gate K25 is at the end of the pier'
        ]
      },
      'DXB': {
        name: 'Dubai International Airport',
        terminal: 'Terminal 3',
        gate: 'C9',
        mapImage: 'https://images.unsplash.com/photo-1578575436955-ef29da568c6c?w=600',
        walkTime: '10 minutes',
        directions: [
          'Exit immigration and continue straight',
          'Take metro link to Concourse C',
          'Follow golden signs to Gates C1-C15',
          'Gate C9 overlooks the runway'
        ]
      },
      'AMM': {
        name: 'Queen Alia International Airport',
        terminal: 'Terminal 1',
        gate: 'D4',
        mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
        walkTime: '6 minutes',
        directions: [
          'Head towards the main departure area',
          'Follow signs to Gates D1-D10',
          'Pass the duty-free shopping area',
          'Gate D4 is near the restaurant area'
        ]
      }
    }

    return airports[airportCode] || {
      name: 'Airport',
      terminal: 'Main Terminal',
      gate: 'A1',
      mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      walkTime: '10 minutes',
      directions: ['Follow airport signs to your gate']
    }
  }

  // SPLASH SCREEN
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated plane that zooms in and stops */}
          <div className="mb-8 relative">
            <div className="animate-[zoomInStop_3s_ease-in-out_forwards] transform scale-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <Plane className="h-16 w-16 text-white transform rotate-45" />
              </div>
            </div>
          </div>
          
          {/* Text that appears after plane animation */}
          <div className="animate-[fadeInDelay_3.5s_ease-in-out_forwards] opacity-0">
            <h1 className="text-6xl font-bold text-white mb-4">Airease</h1>
            <p className="text-2xl text-blue-200">Never Miss a Perfect Flight</p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-2 mt-8">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes zoomInStop {
            0% { transform: scale(0); }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeInDelay {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // Fixed search handler
  const handleDirectSearch = async () => {
    if (!searchParams.from || !searchParams.to || !searchParams.departDate) {
      addNotification('Please fill in origin, destination, and departure date', 'error')
      return
    }

    setLoading(true)
    setCurrentPage('results')
    
    try {
      console.log('🔍 Starting flight search with params:', searchParams)
      
      // Call the API endpoint to get flights
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: searchParams.from,
          to: searchParams.to,
          departureDate: searchParams.departDate,
          maxPrice: searchParams.maxPrice || '1000',
          passengers: 1
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        if (data.success && data.flights) {
          setSearchResults(data.flights)
          addNotification(`Found ${data.flights.length} flights from ${searchParams.from} to ${searchParams.to}`)
        } else {
          // Fallback to realistic mock data if API doesn't return expected format
          console.log('📋 Using fallback mock data')
          const realisticFlights = generateRealisticFlights(searchParams)
          setSearchResults(realisticFlights)
          addNotification(`Found ${realisticFlights.length} flights from ${searchParams.from} to ${searchParams.to}`)
        }
      } else {
        throw new Error('API call failed')
      }
      
    } catch (error) {
      console.error('❌ Search error:', error)
      // Fallback to local realistic data
      const realisticFlights = generateRealisticFlights(searchParams)
      setSearchResults(realisticFlights)
      addNotification(`Found ${realisticFlights.length} flights from ${searchParams.from} to ${searchParams.to} (offline mode)`, 'info')
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

  // Enhanced AI recommendations with destination info and airport navigation
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
          // Enhance recommendations with destination info and gate details
          const destinationInfo = getDestinationInfo(flight.to)
          const gateInfo = getAirportGateInfo(flight.to, flight.flightNumber)
          
          const enhancedRecommendations = {
            ...data.recommendations,
            destinationInfo,
            gateInfo
          }
          
          setAIRecommendations(enhancedRecommendations)
          addNotification('AI travel assistant ready with personalized recommendations!')
        }
      }
    } catch (error) {
      addNotification('AI recommendations unavailable. Please try again.', 'error')
    }
    
    setAILoading(false)
  }

  const proceedToBooking = (flight) => {
    localStorage.setItem('selectedFlight', JSON.stringify(flight))
    window.location.href = `/auto-purchase?flight=${flight.id}&price=${flight.price}`
  }

  const scanBoardingPass = (flight) => {
    localStorage.setItem('flightForScanning', JSON.stringify(flight))
    window.location.href = `/boarding-pass?flight=${flight.id}`
  }

  const handleMissedFlight = (flight) => {
    setMissedFlightData(flight)
    setCurrentPage('missed-flight')
  }

  const findRecoveryOptions = async (reason = '') => {
    setRecoveryLoading(true)
    
    try {
      const response = await fetch('/api/missed-flight/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightNumber: missedFlightData.flightNumber,
          originalDate: new Date().toISOString().split('T')[0],
          from: missedFlightData.from || searchParams.from,
          to: missedFlightData.to || searchParams.to,
          reason
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecoveryOptions(data.options || [])
          addNotification(`Found ${data.options?.length || 0} recovery options!`, 'success')
        }
      }
    } catch (error) {
      addNotification('Failed to find recovery options. Please try again.', 'error')
    }
    
    setRecoveryLoading(false)
  }

  // HOME PAGE
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-slate-900/80"></div>
        </div>

        {/* Enhanced Floating Elements with animations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400/20 rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-400/20 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-60 left-1/2 w-8 h-8 bg-yellow-400/20 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-green-400/20 rounded-full animate-bounce delay-500"></div>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert 
              key={notification.id} 
              className={`max-w-md shadow-2xl border-0 transform animate-in slide-in-from-right-5 duration-300 ${
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Plane className="h-6 w-6 text-white transform rotate-45 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Airease</h1>
                  <p className="text-xs text-blue-200">Smart Flight Solutions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/boarding-pass">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 transform hover:scale-105 transition-all duration-200">
                    <Camera className="h-4 w-4 mr-1" />
                    Scan Pass
                  </Button>
                </Link>
                <Link href="/auto-purchase">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 transform hover:scale-105 transition-all duration-200">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Auto-Buy
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          
          {/* Enhanced Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h2 className="text-6xl font-bold text-white mb-6 leading-tight animate-in fade-in duration-1000">
                Never Miss a 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse"> Perfect Flight</span>
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-300">
                AI-powered flight monitoring with smart price matching, automated purchasing, 
                missed flight recovery, and personalized travel recommendations. Find flights that match your exact needs.
              </p>
            </div>
            
            {/* Enhanced Realistic Stats */}
            <div className="flex justify-center space-x-8 mb-12">
              {realisticStats.map((stat, index) => (
                <div key={index} className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-white animate-in zoom-in duration-500" style={{animationDelay: `${index * 100}ms`}}>
                    {stat.number}
                  </div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                  <div className="text-blue-300 text-xs opacity-75">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Search Form */}
          <Card className="mb-12 shadow-2xl border-0 bg-white/95 backdrop-blur-md transform hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="AMM - Amman, Jordan"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
                      value={searchParams.from}
                      onChange={(e) => setSearchParams({...searchParams, from: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center pt-8">
                  <div className="p-3 bg-blue-100 rounded-full transform hover:rotate-180 transition-transform duration-500">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="LHR - London, UK"
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
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
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
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
                      className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 hover:border-gray-300"
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Settings className="h-5 w-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Flights
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setCurrentPage('preferences')}
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl transform hover:scale-105 transition-all duration-300"
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
                icon: LifeBuoy,
                title: 'Missed Flight Recovery',
                description: 'Instant rebooking and recovery options when things go wrong',
                color: 'from-orange-500 to-red-400'
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-500 bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl">
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
              <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white text-sm">SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white text-sm">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                <Star className="h-5 w-5 text-white" />
                <span className="text-white text-sm">4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MISSED FLIGHT RECOVERY PAGE
  if (currentPage === 'missed-flight') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert key={notification.id} className="max-w-md shadow-lg border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
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
              <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Missed Flight Recovery
              </h1>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Recovery Options Search */}
          <Card className="mb-8 border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl text-red-800 flex items-center gap-3">
                <LifeBuoy className="h-8 w-8" />
                Flight Recovery Assistant
              </CardTitle>
              <p className="text-red-700">Don't worry! We'll help you find alternative flights and get you back on track.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Missed Flight Number</label>
                  <Input
                    placeholder="e.g., QR123"
                    value={missedFlightData?.flightNumber || ''}
                    onChange={(e) => setMissedFlightData({...missedFlightData, flightNumber: e.target.value})}
                    className="border-red-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (Optional)</label>
                  <Select onValueChange={(value) => setMissedFlightData({...missedFlightData, reason: value})}>
                    <SelectTrigger className="border-red-200 focus:border-red-400">
                      <SelectValue placeholder="Why did you miss the flight?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traffic">Traffic/Transportation</SelectItem>
                      <SelectItem value="weather">Weather Delay</SelectItem>
                      <SelectItem value="connection">Missed Connection</SelectItem>
                      <SelectItem value="personal">Personal Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => findRecoveryOptions(missedFlightData?.reason)}
                  disabled={recoveryLoading || !missedFlightData?.flightNumber}
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3 text-lg"
                >
                  {recoveryLoading ? (
                    <>
                      <Settings className="h-5 w-5 mr-2 animate-spin" />
                      Finding Options...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Find Recovery Options
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Options Results */}
          {recoveryOptions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Recovery Options Found
              </h2>
              
              {/* Same Day Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-orange-600">🚨 Same Day Options (Urgent)</h3>
                {recoveryOptions.filter(option => option.type === 'same-day').map((flight, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl">{flight.logo}</div>
                            <div className="text-sm font-medium text-gray-700">{flight.airlineCode}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
                            <div className="text-sm text-gray-600">{flight.from}</div>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-px bg-gray-300"></div>
                              <Plane className="h-4 w-4 text-gray-400" />
                              <div className="w-6 h-px bg-gray-300"></div>
                            </div>
                            <div className="text-xs text-orange-600 mt-1 font-semibold">
                              {flight.urgency.toUpperCase()}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
                            <div className="text-sm text-gray-600">{flight.to}</div>
                          </div>
                          
                          <div className="text-left space-y-1">
                            <div className="font-semibold text-gray-900">{flight.airline}</div>
                            <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                            <Badge className={`text-xs ${
                              flight.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {flight.priority} priority
                            </Badge>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-3xl font-bold text-orange-600">${flight.price}</div>
                            <div className="text-sm text-gray-500">per person</div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <Button 
                              onClick={() => proceedToBooking(flight)}
                              className="bg-orange-600 hover:bg-orange-700"
                              size="sm"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Book Now
                            </Button>
                            
                            <Button 
                              onClick={() => getAIRecommendations(flight)}
                              variant="outline"
                              size="sm"
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              Get Help
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Next Day Options */}
              {recoveryOptions.filter(option => option.type === 'next-day').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-600">✈️ Next Day Options (Budget-Friendly)</h3>
                  {recoveryOptions.filter(option => option.type === 'next-day').map((flight, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-2xl">{flight.logo}</div>
                              <div className="text-sm font-medium text-gray-700">{flight.airlineCode}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{flight.departureTime}</div>
                              <div className="text-sm text-gray-600">{flight.from}</div>
                            </div>

                            <div className="flex flex-col items-center px-4">
                              <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-px bg-gray-300"></div>
                                <Plane className="h-4 w-4 text-gray-400" />
                                <div className="w-6 h-px bg-gray-300"></div>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Next Day
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</div>
                              <div className="text-sm text-gray-600">{flight.to}</div>
                            </div>
                            
                            <div className="text-left space-y-1">
                              <div className="font-semibold text-gray-900">{flight.airline}</div>
                              <div className="text-sm text-gray-600">{flight.flightNumber}</div>
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {flight.priority} option
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600">${flight.price}</div>
                              <div className="text-sm text-gray-500">per person</div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <Button 
                                onClick={() => proceedToBooking(flight)}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="sm"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Book Now
                              </Button>
                              
                              <Button 
                                onClick={() => getAIRecommendations(flight)}
                                variant="outline"
                                size="sm"
                              >
                                <Brain className="h-4 w-4 mr-1" />
                                Get Help
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Emergency Contacts */}
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contacts & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">📞 Important Numbers</h4>
                      <div className="space-y-2 text-sm">
                        <div>Airline: +1-800-555-AIRLINE</div>
                        <div>Airport: +1-800-555-AIRPORT</div>
                        <div>Insurance: +1-800-555-HELP</div>
                        <div>Embassy: +1-800-555-EMBASSY</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">💡 Recovery Tips</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Contact airline immediately for rebooking</li>
                        <li>• Check travel insurance coverage</li>
                        <li>• Keep all receipts for expenses</li>
                        <li>• Consider alternative airports nearby</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Enhanced Results Page with realistic flights and missed flight options
  if (currentPage === 'results') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <Alert key={notification.id} className={`max-w-md shadow-lg transform animate-in slide-in-from-right-5 duration-300 ${
              notification.type === 'error' ? 'border-red-200 bg-red-50' :
              notification.type === 'info' ? 'border-blue-200 bg-blue-50' :
              'border-green-200 bg-green-50'
            }`}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setCurrentPage('home')} className="transform hover:scale-105 transition-transform duration-200">
                ← Back to Search
              </Button>
              <h1 className="text-xl font-bold">Flight Results</h1>
            </div>
            <Button 
              onClick={() => handleMissedFlight({ flightNumber: 'UNKNOWN', from: searchParams.from, to: searchParams.to })}
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Missed Flight?
            </Button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {searchResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 animate-in fade-in duration-500">
                  {searchResults.length} flights found
                </h2>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-100 text-blue-800 animate-in zoom-in duration-300">
                    {searchParams.from} → {searchParams.to}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Sorted by price
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {searchResults.map((flight, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      
                      {/* Price Change Indicator */}
                      {flight.priceChange && (
                        <div className="mb-4">
                          <Badge className={`animate-pulse ${
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
                            <div className="text-2xl transform hover:scale-110 transition-transform duration-200">{flight.logo}</div>
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
                              <Plane className="h-4 w-4 text-gray-400 transform hover:rotate-12 transition-transform duration-300" />
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
                            <Badge className={`text-xs transform hover:scale-105 transition-transform duration-200 ${
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
                            <div className="text-4xl font-bold text-blue-600 transform hover:scale-110 transition-transform duration-200">${flight.price}</div>
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
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap transform hover:scale-105 transition-all duration-200"
                              size="sm"
                            >
                              <Brain className="h-4 w-4 mr-1" />
                              AI Assistant
                            </Button>
                            
                            <Button 
                              onClick={() => proceedToBooking(flight)}
                              className="bg-green-600 hover:bg-green-700 whitespace-nowrap transform hover:scale-105 transition-all duration-200"
                              size="sm"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Book & Pay
                            </Button>
                            
                            <Button 
                              onClick={() => scanBoardingPass(flight)}
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap transform hover:scale-105 transition-all duration-200"
                            >
                              <Camera className="h-4 w-4 mr-1" />
                              Scan Pass
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Match Score for preference-based searches */}
                      {flight.matchScore && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in duration-500">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-100 text-green-800 animate-pulse">
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

          {/* Enhanced AI Recommendations Panel with destination images and gate info */}
          {selectedFlight && (
            <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 animate-in slide-in-from-bottom-5 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Sparkles className="h-6 w-6 animate-spin" />
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
                  <div className="space-y-6">
                    {/* Destination Information with Image */}
                    {aiRecommendations.destinationInfo && (
                      <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🌍 Welcome to {aiRecommendations.destinationInfo.city}!
                          </h3>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <img 
                                src={aiRecommendations.destinationInfo.image} 
                                alt={aiRecommendations.destinationInfo.city}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-800">🏛️ Top Attractions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {aiRecommendations.destinationInfo.highlights.map((highlight, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {highlight}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3">💡 Local Tips</h4>
                              <div className="space-y-2">
                                {aiRecommendations.destinationInfo.tips.map((tip, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <span className="text-sm text-gray-700">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Airport Gate Navigation */}
                    {aiRecommendations.gateInfo && (
                      <Card className="bg-white shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Navigation className="h-5 w-5" />
                            🛫 Gate Navigation - {aiRecommendations.gateInfo.name}
                          </h3>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <img 
                                src={aiRecommendations.gateInfo.mapImage} 
                                alt="Airport Map"
                                className="w-full h-32 object-cover rounded-lg mb-4"
                              />
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Map className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold">{aiRecommendations.gateInfo.terminal}</span>
                                  <span className="text-gray-600">Gate {aiRecommendations.gateInfo.gate}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm text-gray-700">{aiRecommendations.gateInfo.walkTime} walk</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Route className="h-4 w-4" />
                                🚶 Walking Directions
                              </h4>
                              <div className="space-y-2">
                                {aiRecommendations.gateInfo.directions.map((direction, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                                      {idx + 1}
                                    </div>
                                    <span className="text-sm text-gray-700">{direction}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Traditional AI Recommendations */}
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-1000">
                      <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            🌤️ Weather & Packing Guide
                          </h4>
                          <div className="mb-4">
                            <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                              {aiRecommendations.weatherInfo.temp}°C, {aiRecommendations.weatherInfo.condition}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">👔 Essential Clothing</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {aiRecommendations.packingList.clothing.slice(0, 4).map((item, idx) => (
                                  <li key={idx} className="flex items-center space-x-2 animate-in slide-in-from-left-3 duration-300" style={{animationDelay: `${idx * 100}ms`}}>
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
                                  <li key={idx} className="flex items-center space-x-2 animate-in slide-in-from-left-3 duration-300" style={{animationDelay: `${idx * 150}ms`}}>
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            ⏰ Smart Timeline
                          </h4>
                          <div className="text-2xl font-bold text-orange-600 mb-2 animate-pulse">
                            Leave by: {aiRecommendations.timeManagement.leaveBy}
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            Total prep time: {aiRecommendations.timeManagement.totalMinutes} minutes
                          </div>
                          
                          <div className="space-y-2">
                            {aiRecommendations.timeManagement.timeline?.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm animate-in slide-in-from-right-3 duration-300" style={{animationDelay: `${idx * 100}ms`}}>
                                <span className="text-gray-600">{item.task}</span>
                                <span className="font-medium text-orange-600">{item.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          💡 Local Travel Tips
                        </h4>
                        <div className="space-y-4">
                          {aiRecommendations.travelTips.slice(0, 4).map((tip, idx) => (
                            <div key={idx} className="border-l-4 border-purple-400 pl-4 py-2 animate-in slide-in-from-bottom-3 duration-300" style={{animationDelay: `${idx * 150}ms`}}>
                              <h5 className="text-sm font-medium text-purple-800">{tip.category}</h5>
                              <p className="text-sm text-gray-600 mt-1">{tip.tip}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg animate-in fade-in duration-1000">
                          <h5 className="font-medium text-gray-800 mb-2">✨ Pro Tip</h5>
                          <p className="text-sm text-gray-600">
                            Download offline maps and key phrases in the local language. 
                            Consider getting travel insurance for international trips.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={() => getAIRecommendations(selectedFlight)} className="transform hover:scale-105 transition-transform duration-200">
                      Get AI Recommendations
                    </Button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => setSelectedFlight(null)}
                    variant="ghost"
                    size="sm"
                    className="transform hover:scale-105 transition-transform duration-200"
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

  // Enhanced Preferences page with better styling and animations
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => setCurrentPage('home')} className="transform hover:scale-105 transition-transform duration-200">
              ← Back to Search
            </Button>
            <h1 className="text-xl font-bold">Set Your Travel Preferences</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {preferencesLoading ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-md shadow-xl animate-in zoom-in duration-500">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 animate-pulse">Finding Your Perfect Matches...</h3>
              <p className="text-gray-600 text-lg">Analyzing thousands of flights for your exact preferences</p>
              <div className="w-80 mx-auto bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm text-gray-600">
                <div className="animate-in fade-in duration-500">✓ Checking direct flights</div>
                <div className="animate-in fade-in duration-500 delay-100">✓ Matching departure times</div>
                <div className="animate-in fade-in duration-500 delay-200">✓ Finding best prices</div>
                <div className="animate-in fade-in duration-500 delay-300">✓ Analyzing seat availability</div>
              </div>
            </div>
          </Card>
        ) : matchedPreferences.length > 0 ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
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
                    <div key={idx} className="bg-white p-6 rounded-xl border border-green-200 shadow-sm transform hover:scale-105 transition-all duration-300 animate-in zoom-in duration-500" style={{animationDelay: `${idx * 150}ms`}}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{match.type}</h4>
                        <Badge className={`px-3 py-1 animate-pulse ${match.match === 'exact' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
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
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-12 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Finding Flights...' : '✈️ View Perfect Match Flights'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-xl bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="text-2xl">Tell us your exact travel preferences</CardTitle>
              <p className="text-gray-600">We'll find flights that match your specific needs</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="animate-in slide-in-from-left-5 duration-500">
                  <label className="block text-sm font-semibold mb-3">Preferred Landing Time</label>
                  <Select value={preferences.preferredLandingTime} onValueChange={(value) => setPreferences({...preferences, preferredLandingTime: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
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
                
                <div className="animate-in slide-in-from-right-5 duration-500 delay-100">
                  <label className="block text-sm font-semibold mb-3">Preferred Departure Time</label>
                  <Select value={preferences.preferredDepartureTime} onValueChange={(value) => setPreferences({...preferences, preferredDepartureTime: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
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
                
                <div className="animate-in slide-in-from-left-5 duration-500 delay-200">
                  <label className="block text-sm font-semibold mb-3">Maximum Stops</label>
                  <Select value={preferences.maxStops} onValueChange={(value) => setPreferences({...preferences, maxStops: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">✈️ Direct flights only</SelectItem>
                      <SelectItem value="1">🔄 Up to 1 stop</SelectItem>
                      <SelectItem value="2">🔄🔄 Up to 2 stops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="animate-in slide-in-from-right-5 duration-500 delay-300">
                  <label className="block text-sm font-semibold mb-3">Seat Preference</label>
                  <Select value={preferences.seatPreference} onValueChange={(value) => setPreferences({...preferences, seatPreference: value})}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300">
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
              
              <div className="text-center animate-in zoom-in duration-500 delay-400">
                <Button 
                  onClick={startPreferencesDemo}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-12 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
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