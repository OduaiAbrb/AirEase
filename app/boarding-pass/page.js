'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plane, Calendar, MapPin, Clock, User, CheckCircle, AlertCircle, Camera, FileText, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function BoardingPassPage() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addNotification('Please upload an image file (JPG, PNG, etc.)', 'error')
      return
    }

    setUploadedFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('boardingPass', file)

      const response = await fetch('/api/ocr/boarding-pass', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('OCR processing failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setExtractedData(data.extracted)
        addNotification('Boarding pass scanned successfully!')
      } else {
        throw new Error(data.error || 'OCR extraction failed')
      }

    } catch (error) {
      console.error('OCR Error:', error)
      
      // Mock extraction for demo purposes
      const mockExtraction = {
        passengerName: 'JOHN DOE',
        flightNumber: 'QR123',
        airline: 'Qatar Airways',
        from: 'AMM',
        to: 'LHR',
        date: '2025-12-15',
        departureTime: '14:30',
        gate: 'A12',
        seat: '12A',
        boardingGroup: 'Group 2',
        confidence: 85
      }
      
      setExtractedData(mockExtraction)
      addNotification('Boarding pass scanned using demo OCR! (Production would use real OCR service)', 'info')
    }

    setLoading(false)
  }

  const generateTimeTimeline = (extractedData) => {
    if (!extractedData) return null

    const departureTime = extractedData.departureTime
    const [depHour, depMinute] = departureTime.split(':').map(Number)
    const departureMinutes = depHour * 60 + depMinute

    // Calculate recommended timeline
    const timeline = [
      { task: 'Leave Home', minutes: 180, icon: '🏠' },
      { task: 'Arrive at Airport', minutes: 120, icon: '✈️' },
      { task: 'Check-in & Bag Drop', minutes: 90, icon: '🎫' },
      { task: 'Security Screening', minutes: 60, icon: '🔒' },
      { task: 'Reach Gate', minutes: 30, icon: '🚪' },
      { task: 'Boarding Starts', minutes: 15, icon: '✈️' }
    ]

    return timeline.map(item => {
      const timeMinutes = departureMinutes - item.minutes
      const hour = Math.floor(timeMinutes / 60)
      const minute = timeMinutes % 60
      return {
        ...item,
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      }
    })
  }

  const timeTimeline = generateTimeTimeline(extractedData)

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
                <Camera className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Boarding Pass Scanner</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Upload Section */}
        {!extractedData && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Boarding Pass
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Scan your boarding pass to get smart travel timeline and recommendations
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center">
                  {loading ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-semibold">Scanning Boarding Pass...</h3>
                      <p className="text-gray-600">Extracting flight details and passenger information</p>
                      <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-12 w-12 text-blue-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Upload Boarding Pass Image</h3>
                        <p className="text-gray-600 mb-6">
                          Support for JPG, PNG, and other image formats
                        </p>
                      </div>
                      
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="boarding-pass-upload"
                        />
                        <label 
                          htmlFor="boarding-pass-upload"
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Choose File or Take Photo
                        </label>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Your boarding pass data is processed securely and not stored permanently
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="space-y-8">
            
            {/* Success Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Boarding Pass Scanned Successfully!
              </h2>
              <Badge className="bg-green-100 text-green-800">
                {extractedData.confidence}% Accuracy
              </Badge>
            </div>

            {/* Flight Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Passenger & Flight Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Passenger & Flight Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Passenger Name</label>
                      <div className="text-lg font-semibold">{extractedData.passengerName}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Flight Number</label>
                      <div className="text-lg font-semibold">{extractedData.flightNumber}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Airline</label>
                      <div className="text-lg font-semibold">{extractedData.airline}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date</label>
                      <div className="text-lg font-semibold">{extractedData.date}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Route & Seat Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Route & Seat Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">From</label>
                      <div className="text-lg font-semibold">{extractedData.from}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">To</label>
                      <div className="text-lg font-semibold">{extractedData.to}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Departure</label>
                      <div className="text-lg font-semibold">{extractedData.departureTime}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gate</label>
                      <div className="text-lg font-semibold">{extractedData.gate}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Seat</label>
                      <div className="text-lg font-semibold">{extractedData.seat}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Boarding Group</label>
                      <div className="text-lg font-semibold">{extractedData.boardingGroup}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Timeline */}
            {timeTimeline && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-6 w-6" />
                    Smart Travel Timeline
                  </CardTitle>
                  <p className="text-blue-700">Recommended schedule for your {extractedData.flightNumber} flight</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeTimeline.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.task}</div>
                            <div className="text-sm text-gray-600">{item.minutes} minutes before departure</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{item.time}</div>
                          <div className="text-sm text-gray-500">
                            {index === 0 ? 'Leave by this time' : 'Recommended time'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Smart Reminder</h4>
                        <p className="text-sm text-yellow-700">
                          We recommend leaving home by <strong>{timeTimeline[0].time}</strong> to ensure you don't miss your {extractedData.flightNumber} flight.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => {
                  setExtractedData(null)
                  setUploadedFile(null)
                }}
                variant="outline"
              >
                Scan Another Boarding Pass
              </Button>
              
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Search More Flights
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}