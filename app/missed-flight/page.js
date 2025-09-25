'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Plane, Phone, CheckCircle, ArrowLeft, Zap, MapPin, Calendar, CreditCard } from "lucide-react"
import Link from 'next/link'

export default function MissedFlightPage() {
  const [missedFlightData, setMissedFlightData] = useState({
    flightNumber: '',
    originalDate: '',
    from: '',
    to: '',
    reason: ''
  })
  
  const [recoveryOptions, setRecoveryOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [emergencyContacts, setEmergencyContacts] = useState(null)
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const findRecoveryOptions = async () => {
    if (!missedFlightData.flightNumber || !missedFlightData.from || !missedFlightData.to) {
      addNotification('Please fill in flight details', 'error')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/missed-flight/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missedFlightData)
      })

      const data = await response.json()
      
      if (data.success) {
        setRecoveryOptions(data.options)
        setEmergencyContacts(data.emergencyContacts)
        addNotification('Found recovery options for your missed flight!')
      }
    } catch (error) {
      console.error('Recovery search error:', error)
      
      // Mock recovery options for demo
      const mockOptions = generateMockRecoveryOptions()
      setRecoveryOptions(mockOptions.options)
      setEmergencyContacts(mockOptions.emergencyContacts)
      addNotification('Recovery options found (demo mode)!')
    }
    
    setLoading(false)
  }

  const generateMockRecoveryOptions = () => {
    const baseDate = new Date()
    baseDate.setHours(baseDate.getHours() + 2) // 2 hours from now
    
    return {
      options: [
        {
          id: '1',
          type: 'same-day',
          airline: 'Qatar Airways',
          flightNumber: 'QR127',
          departureTime: formatTime(baseDate),
          arrivalTime: formatTime(new Date(baseDate.getTime() + 6*60*60*1000)),
          price: 450,
          available: true,
          priority: 'high',
          notes: 'Next available flight today'
        },
        {
          id: '2', 
          type: 'same-day',
          airline: 'Emirates',
          flightNumber: 'EK107',
          departureTime: formatTime(new Date(baseDate.getTime() + 4*60*60*1000)),
          arrivalTime: formatTime(new Date(baseDate.getTime() + 10*60*60*1000)),
          price: 520,
          available: true,
          priority: 'medium',
          notes: '1 stop via Dubai'
        },
        {
          id: '3',
          type: 'next-day',
          airline: 'Turkish Airlines', 
          flightNumber: 'TK125',
          departureTime: formatTime(new Date(baseDate.getTime() + 18*60*60*1000)),
          arrivalTime: formatTime(new Date(baseDate.getTime() + 24*60*60*1000)),
          price: 380,
          available: true,
          priority: 'budget',
          notes: 'Early morning departure'
        }
      ],
      emergencyContacts: {
        airline: '+1-800-555-0199',
        airport: '+1-800-555-0188', 
        insurance: '+1-800-555-0177',
        embassy: '+1-800-555-0166'
      }
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const bookRecoveryFlight = async (option) => {
    try {
      const response = await fetch('/api/missed-flight/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalFlight: missedFlightData,
          recoveryOption: option
        })
      })

      if (response.ok) {
        addNotification(`Recovery flight ${option.flightNumber} booking initiated!`)
        // Redirect to auto-purchase with recovery context
        window.location.href = `/auto-purchase?recovery=true&flight=${option.id}&price=${option.price}`
      }
    } catch (error) {
      addNotification('Booking failed. Please call the airline directly.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Alert 
            key={notification.id} 
            className={`max-w-md shadow-lg ${
              notification.type === 'error' ? 'border-red-200 bg-red-50' : 
              'border-green-200 bg-green-50'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Search
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Missed Flight Recovery</h1>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              Emergency Assistance
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {!recoveryOptions.length ? (
          <div className="space-y-8">
            
            {/* Emergency Alert */}
            <Alert className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="text-lg">
                <div className="space-y-2">
                  <div className="font-bold text-orange-800">Missed your flight? Don't panic!</div>
                  <div className="text-orange-700">
                    We'll help you find the fastest alternative options and handle rebooking automatically.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Flight Details Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Plane className="h-6 w-6" />
                  Tell us about your missed flight
                </CardTitle>
                <p className="text-gray-600">We need these details to find the best recovery options</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flight Number</label>
                    <Input
                      placeholder="QR123, EK105, etc."
                      value={missedFlightData.flightNumber}
                      onChange={(e) => setMissedFlightData({...missedFlightData, flightNumber: e.target.value.toUpperCase()})}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        className="pl-10 h-12 text-base"
                        value={missedFlightData.originalDate}
                        onChange={(e) => setMissedFlightData({...missedFlightData, originalDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="AMM, JFK, LHR"
                        className="pl-10 h-12 text-base"
                        value={missedFlightData.from}
                        onChange={(e) => setMissedFlightData({...missedFlightData, from: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="LHR, DXB, JFK"
                        className="pl-10 h-12 text-base"
                        value={missedFlightData.to}
                        onChange={(e) => setMissedFlightData({...missedFlightData, to: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Missing Flight (Optional)</label>
                  <Input
                    placeholder="Traffic delay, cancelled connection, etc."
                    value={missedFlightData.reason}
                    onChange={(e) => setMissedFlightData({...missedFlightData, reason: e.target.value})}
                    className="h-12 text-base"
                  />
                </div>

                <div className="text-center">
                  <Button
                    onClick={findRecoveryOptions}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-4 text-lg"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Finding Options...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Find Recovery Flights
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts Preview */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-blue-800">Airline Customer Service</div>
                    <div className="text-blue-600">Available 24/7 for rebooking</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Airport Information</div>
                    <div className="text-blue-600">Current flight status & gates</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Travel Insurance</div>
                    <div className="text-blue-600">Coverage for missed connections</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Embassy Services</div>
                    <div className="text-blue-600">For international travel issues</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        ) : (

          /* Recovery Options Display */
          <div className="space-y-8">
            
            {/* Success Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recovery Options Found!
              </h2>
              <p className="text-gray-600 text-lg">
                We found {recoveryOptions.length} alternative flights for {missedFlightData.from} → {missedFlightData.to}
              </p>
            </div>

            {/* Recovery Options */}
            <div className="space-y-4">
              {recoveryOptions.map((option, index) => (
                <Card key={index} className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${
                  option.priority === 'high' ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' :
                  option.priority === 'medium' ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white' :
                  'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
                }`}>
                  <CardContent className="p-6">
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge className={`${
                          option.priority === 'high' ? 'bg-green-100 text-green-800' :
                          option.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {option.priority === 'high' ? '🚀 Fastest' :
                           option.priority === 'medium' ? '⚡ Recommended' :
                           '💰 Budget'}
                        </Badge>
                        
                        <Badge variant="outline">
                          {option.type === 'same-day' ? 'Today' : 'Tomorrow'}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${option.price}</div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{option.departureTime}</div>
                          <div className="text-sm text-gray-600">{missedFlightData.from}</div>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-px bg-gray-300"></div>
                            <Plane className="h-4 w-4 text-gray-400" />
                            <div className="w-6 h-px bg-gray-300"></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{option.airline}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-900">{option.arrivalTime}</div>
                          <div className="text-sm text-gray-600">{missedFlightData.to}</div>
                        </div>

                        <div className="text-left">
                          <div className="font-semibold text-gray-900">{option.flightNumber}</div>
                          <div className="text-sm text-gray-600">{option.notes}</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => bookRecoveryFlight(option)}
                          className={`${
                            option.priority === 'high' ? 'bg-green-600 hover:bg-green-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Contacts */}
            {emergencyContacts && (
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Phone className="h-6 w-6" />
                    Emergency Support Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-800">Airline Support</span>
                        <a href={`tel:${emergencyContacts.airline}`} className="text-blue-600 font-mono">
                          {emergencyContacts.airline}
                        </a>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-800">Airport Info</span>
                        <a href={`tel:${emergencyContacts.airport}`} className="text-blue-600 font-mono">
                          {emergencyContacts.airport}
                        </a>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-800">Travel Insurance</span>
                        <a href={`tel:${emergencyContacts.insurance}`} className="text-blue-600 font-mono">
                          {emergencyContacts.insurance}
                        </a>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-800">Embassy Services</span>
                        <a href={`tel:${emergencyContacts.embassy}`} className="text-blue-600 font-mono">
                          {emergencyContacts.embassy}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setRecoveryOptions([])
                  setEmergencyContacts(null)
                }}
                variant="outline"
              >
                Search Different Flight
              </Button>
              
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Return to Main Search
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}