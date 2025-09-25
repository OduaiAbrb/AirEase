'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Search, MapPin, Calendar, DollarSign, Heart, Clock, ArrowRight, Mail, Brain, CheckCircle, AlertCircle, Sparkles, Zap, Target, Settings, Filter, Camera, CreditCard, Star, Wifi, Coffee, Monitor, Shield, TrendingDown, TrendingUp, AlertTriangle, Phone, LifeBuoy, Navigation, Map, Compass, Route, MessageCircle, Send, User, Bookmark, Bell, Globe, Headphones, HelpCircle, LogIn, UserPlus, LogOut } from "lucide-react"
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
  
  // New AI Assistant Screen States
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    travelPreference: 'budget'
  })

  // Synthetic User Database
  const syntheticUsers = {
    'john@airease.com': {
      id: 'user_001',
      name: 'John Thompson',
      email: 'john@airease.com',
      password: 'password123',
      avatar: '👨‍💼',
      preferenceLevel: 'Business Traveler',
      totalFlights: 47,
      savedAmount: '$12,400',
      favoriteDestinations: ['LHR', 'JFK', 'DXB'],
      travelStatus: 'Gold Member',
      joinedDate: '2023-03-15',
      upcomingTrips: 3,
      notifications: true
    },
    'sarah@airease.com': {
      id: 'user_002', 
      name: 'Sarah Chen',
      email: 'sarah@airease.com',
      password: 'travel2024',
      avatar: '👩‍💻',
      preferenceLevel: 'Adventure Seeker',
      totalFlights: 23,
      savedAmount: '$5,890',
      favoriteDestinations: ['CDG', 'NRT', 'SYD'],
      travelStatus: 'Explorer',
      joinedDate: '2023-08-22',
      upcomingTrips: 1,
      notifications: true
    },
    'mike@airease.com': {
      id: 'user_003',
      name: 'Mike Rodriguez',
      email: 'mike@airease.com', 
      password: 'flyme456',
      avatar: '👨‍🎨',
      preferenceLevel: 'Budget Conscious',
      totalFlights: 12,
      savedAmount: '$2,150',
      favoriteDestinations: ['AMM', 'IST', 'CAI'],
      travelStatus: 'Smart Saver',
      joinedDate: '2024-01-10',
      upcomingTrips: 0,
      notifications: false
    }
  }

  // Homepage plane animation effect
  useEffect(() => {
    if (currentPage === 'home' && !showSplash) {
      const timer = setTimeout(() => {
        setShowPlaneAnimation(true)
        setTimeout(() => setShowPlaneAnimation(false), 6000)
      }, 2000) // Start animation 2 seconds after homepage loads
      
      return () => clearTimeout(timer)
    }
  }, [currentPage, showSplash])

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500) // Show splash for 3.5 seconds

    return () => clearTimeout(timer)
  }, [])

  // Plane animation effect for AI Assistant page
  useEffect(() => {
    if (currentPage === 'ai-assistant') {
      setShowPlaneAnimation(true)
      const timer = setTimeout(() => setShowPlaneAnimation(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [currentPage])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Authentication Functions
  const handleLogin = () => {
    const user = syntheticUsers[loginForm.email]
    if (user && user.password === loginForm.password) {
      setCurrentUser(user)
      setIsLoggedIn(true)
      setShowLogin(false)
      setLoginForm({ email: '', password: '' })
      setSearchParams({...searchParams, email: user.email})
      addNotification(`Welcome back, ${user.name}! 🎉`, 'success')
    } else {
      addNotification('Invalid email or password. Try: john@airease.com / password123', 'error')
    }
  }

  const handleSignup = () => {
    if (signupForm.password !== signupForm.confirmPassword) {
      addNotification('Passwords do not match', 'error')
      return
    }

    if (syntheticUsers[signupForm.email]) {
      addNotification('Email already exists. Try logging in instead.', 'error')
      return
    }

    // Create new synthetic user
    const newUser = {
      id: `user_${Date.now()}`,
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
      avatar: '👤',
      preferenceLevel: signupForm.travelPreference === 'business' ? 'Business Traveler' : 
                      signupForm.travelPreference === 'adventure' ? 'Adventure Seeker' : 'Budget Conscious',
      totalFlights: 0,
      savedAmount: '$0',
      favoriteDestinations: [],
      travelStatus: 'New Member',
      joinedDate: new Date().toISOString().split('T')[0],
      upcomingTrips: 0,
      notifications: true
    }

    syntheticUsers[signupForm.email] = newUser
    setCurrentUser(newUser)
    setIsLoggedIn(true)
    setShowSignup(false)
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '', travelPreference: 'budget' })
    setSearchParams({...searchParams, email: newUser.email})
    addNotification(`Welcome to Airease, ${newUser.name}! 🚀`, 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    setSearchParams({...searchParams, email: 'user@airease.com'})
    addNotification('You have been logged out', 'info')
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

  // LOGIN MODAL
  if (showLogin) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <p className="text-gray-600">Sign in to your Airease account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                placeholder="john@airease.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="password123"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="h-12"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">Demo Accounts:</p>
              <div className="text-xs text-blue-600 space-y-1">
                <div>👨‍💼 john@airease.com / password123</div>
                <div>👩‍💻 sarah@airease.com / travel2024</div>
                <div>👨‍🎨 mike@airease.com / flyme456</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleLogin} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12">
                Sign In
              </Button>
              <Button onClick={() => setShowLogin(false)} variant="outline" className="flex-1 h-12">
                Cancel
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => {setShowLogin(false); setShowSignup(true)}}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // SIGNUP MODAL
  if (showSignup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Join Airease!</CardTitle>
            <p className="text-gray-600">Create your travel profile</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={signupForm.name}
                onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="Create a password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Preference</label>
              <Select value={signupForm.travelPreference} onValueChange={(value) => setSignupForm({...signupForm, travelPreference: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">💰 Budget Conscious</SelectItem>
                  <SelectItem value="business">👔 Business Traveler</SelectItem>
                  <SelectItem value="adventure">🌟 Adventure Seeker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleSignup} className="flex-1 bg-green-600 hover:bg-green-700 h-12">
                Create Account
              </Button>
              <Button onClick={() => setShowSignup(false)} variant="outline" className="flex-1 h-12">
                Cancel
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => {setShowSignup(false); setShowLogin(true)}}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
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

  // Enhanced AI recommendations - now redirects to dedicated screen
  const getAIRecommendations = async (flight) => {
    setSelectedFlight(flight)
    setCurrentPage('ai-assistant')
    setAILoading(true)
    setAIRecommendations(null)
    
    // Initialize welcome chat message
    setChatMessages([
      {
        id: 1,
        type: 'bot',
        message: `Welcome! I'm your AI travel assistant for flight ${flight.flightNumber} to ${flight.toCity}. How can I help you today?`,
        timestamp: new Date()
      }
    ])
    
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

  // Chat handler
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)
    
    // Simulate AI response
    setTimeout(() => {
      const responses = {
        'gate': `Your gate is ${aiRecommendations?.gateInfo?.gate || 'A12'} in ${aiRecommendations?.gateInfo?.terminal || 'Terminal 5'}. It's about ${aiRecommendations?.gateInfo?.walkTime || '10 minutes'} walk from security.`,
        'weather': `The weather in ${aiRecommendations?.destinationInfo?.city || selectedFlight?.toCity} is ${aiRecommendations?.weatherInfo?.temp || '15'}°C and ${aiRecommendations?.weatherInfo?.condition || 'partly cloudy'}. Perfect for sightseeing!`,
        'food': `Great question! In ${aiRecommendations?.destinationInfo?.city || selectedFlight?.toCity}, you must try the local specialties. I recommend exploring local markets and authentic restaurants.`,
        'delay': `I'll check for any delays on your flight ${selectedFlight?.flightNumber}. Currently showing on-time departure at ${selectedFlight?.departureTime}. I'll notify you of any changes!`,
        'emergency': `For emergencies, contact the airline at their 24/7 helpline. I can also help you find alternative flights if needed. Is there a specific emergency you need help with?`,
        'default': `I'd be happy to help! I can assist with gate information, weather updates, local recommendations, flight delays, or any travel emergencies. What would you like to know?`
      }
      
      const lowerInput = chatInput.toLowerCase()
      let response = responses.default
      
      if (lowerInput.includes('gate') || lowerInput.includes('terminal')) {
        response = responses.gate
      } else if (lowerInput.includes('weather') || lowerInput.includes('temperature')) {
        response = responses.weather
      } else if (lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('restaurant')) {
        response = responses.food
      } else if (lowerInput.includes('delay') || lowerInput.includes('late') || lowerInput.includes('time')) {
        response = responses.delay
      } else if (lowerInput.includes('emergency') || lowerInput.includes('help') || lowerInput.includes('problem')) {
        response = responses.emergency
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, botMessage])
      setChatLoading(false)
    }, 1500)
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

  // DEDICATED AI ASSISTANT SCREEN
  if (currentPage === 'ai-assistant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        
        {/* Plane Animation with Trail */}
        {showPlaneAnimation && (
          <div className="fixed top-0 left-0 w-full h-full z-40 pointer-events-none">
            <div className="absolute top-1/2 transform -translate-y-1/2 animate-[flyAcross_4s_ease-in-out_forwards]">
              {/* Trail */}
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 animate-[fadeTrail_4s_ease-in-out_forwards]"></div>
              {/* Plane */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <Plane className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        )}

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
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentPage('results')}
                  className="text-indigo-700 hover:bg-white/20"
                >
                  ← Back to Flights
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-indigo-900">AI Travel Assistant</h1>
                    <p className="text-xs text-indigo-600">Personal flight companion</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800">
                  Flight {selectedFlight?.flightNumber}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {selectedFlight?.from} → {selectedFlight?.to}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - User Profile & Ticket Details */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* User Profile Card */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Travel Profile</CardTitle>
                  <p className="text-sm text-gray-600">{searchParams.email}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Bookmark className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Preference Level</div>
                        <div className="text-sm text-gray-600">Experienced Traveler</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Notifications</div>
                        <div className="text-sm text-gray-600">All alerts enabled</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Travel Status</div>
                        <div className="text-sm text-gray-600">Ready to fly</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Details Card */}
              {selectedFlight && (
                <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <CreditCard className="h-5 w-5" />
                      Your Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900 mb-2">{selectedFlight.flightNumber}</div>
                      <div className="text-lg text-gray-700">{selectedFlight.airline}</div>
                      <div className="text-sm text-gray-600 mt-2">{selectedFlight.aircraft}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">From</div>
                          <div className="text-sm text-gray-600">{selectedFlight.fromCity} ({selectedFlight.from})</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">To</div>
                          <div className="text-sm text-gray-600">{selectedFlight.toCity} ({selectedFlight.to})</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-gray-900 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Departure
                          </div>
                          <div className="text-sm text-gray-600">{selectedFlight.departureTime}</div>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-gray-900 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Arrival
                          </div>
                          <div className="text-sm text-gray-600">{selectedFlight.arrivalTime}</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Price</span>
                          <span className="text-2xl font-bold text-blue-600">${selectedFlight.price}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => proceedToBooking(selectedFlight)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Book Now
                      </Button>
                      
                      <Button 
                        onClick={() => scanBoardingPass(selectedFlight)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Scan Pass
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="h-16 flex flex-col">
                      <Phone className="h-5 w-5 mb-1" />
                      <span className="text-xs">Emergency</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-16 flex flex-col">
                      <Navigation className="h-5 w-5 mb-1" />
                      <span className="text-xs">Directions</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-16 flex flex-col">
                      <Bell className="h-5 w-5 mb-1" />
                      <span className="text-xs">Alerts</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-16 flex flex-col">
                      <Headphones className="h-5 w-5 mb-1" />
                      <span className="text-xs">Support</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - AI Recommendations */}
            <div className="lg:col-span-1 space-y-6">
              {aiLoading ? (
                <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center">
                      <Brain className="h-6 w-6 text-purple-600 animate-pulse mr-2" />
                      <span>AI is preparing your personalized travel guide...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : aiRecommendations ? (
                <div className="space-y-6">
                  
                  {/* Destination Information */}
                  {aiRecommendations.destinationInfo && (
                    <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          🌍 Destination: {aiRecommendations.destinationInfo.city}
                        </h3>
                        
                        <img 
                          src={aiRecommendations.destinationInfo.image} 
                          alt={aiRecommendations.destinationInfo.city}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">🏛️ Must Visit</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiRecommendations.destinationInfo.highlights.map((highlight, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">💡 Pro Tips</h4>
                            <div className="space-y-2">
                              {aiRecommendations.destinationInfo.tips.slice(0, 3).map((tip, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Gate Navigation */}
                  {aiRecommendations.gateInfo && (
                    <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Navigation className="h-5 w-5" />
                          Gate Navigation
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900">{aiRecommendations.gateInfo.terminal}</div>
                              <Badge className="bg-blue-100 text-blue-800">Gate {aiRecommendations.gateInfo.gate}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {aiRecommendations.gateInfo.walkTime} walk from security
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3">🚶 Walking Directions</h4>
                            <div className="space-y-2">
                              {aiRecommendations.gateInfo.directions.map((direction, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5">
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

                  {/* Weather & Packing */}
                  <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">🌤️ Weather & Packing</h3>
                      
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Badge className="bg-blue-100 text-blue-800 mb-2">
                            {aiRecommendations.weatherInfo.temp}°C, {aiRecommendations.weatherInfo.condition}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Essential Items</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {aiRecommendations.packingList.clothing.slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0">
                  <CardContent className="p-6 text-center">
                    <Button onClick={() => getAIRecommendations(selectedFlight)}>
                      <Brain className="h-4 w-4 mr-2" />
                      Get AI Recommendations
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Chatbot */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    Travel Assistant Chat
                  </CardTitle>
                  <p className="text-sm text-gray-600">Ask me anything about your flight or destination!</p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your question..."
                        onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleChatSubmit}
                        disabled={chatLoading || !chatInput.trim()}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Quick Questions */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Gate info', 'Weather', 'Local food', 'Delays?'].map((question) => (
                        <Button
                          key={question}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setChatInput(question)
                            setTimeout(handleChatSubmit, 100)
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes flyAcross {
            0% { 
              transform: translateX(-100px) translateY(-50%);
              opacity: 0;
            }
            10% { 
              opacity: 1;
            }
            90% { 
              opacity: 1;
            }
            100% { 
              transform: translateX(calc(100vw + 100px)) translateY(-50%);
              opacity: 0;
            }
          }
          
          @keyframes fadeTrail {
            0% { 
              opacity: 0;
              width: 0;
            }
            20% { 
              opacity: 0.6;
              width: 128px;
            }
            80% { 
              opacity: 0.6;
              width: 128px;
            }
            100% { 
              opacity: 0;
              width: 0;
            }
          }
        `}</style>
      </div>
    )
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