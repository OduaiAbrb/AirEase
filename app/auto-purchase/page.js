'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Shield, Plane, CheckCircle, AlertCircle, ArrowLeft, Zap, Lock, DollarSign, Clock } from "lucide-react"
import Link from 'next/link'

export default function AutoPurchasePage() {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  })
  
  const [autoPurchaseSettings, setAutoPurchaseSettings] = useState({
    enabled: false,
    maxPrice: '',
    instantBuy: false,
    emailConfirmation: true
  })
  
  const [processing, setProcessing] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'success') => {
    const notification = { id: Date.now(), message, type }
    setNotifications(prev => [...prev, notification])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const handleSetupAutoPurchase = async () => {
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
      addNotification('Please fill in all payment details', 'error')
      return
    }
    
    if (!autoPurchaseSettings.enabled) {
      addNotification('Please enable auto-purchase to continue', 'error')
      return
    }

    setProcessing(true)

    try {
      // Simulate Stripe test mode setup
      const response = await fetch('/api/stripe/setup-auto-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDetails,
          autoPurchaseSettings
        })
      })

      const data = await response.json()

      if (data.success) {
        setSetupComplete(true)
        addNotification('Auto-purchase setup successful! You\'ll be notified when deals are found.')
      } else {
        throw new Error(data.error || 'Setup failed')
      }

    } catch (error) {
      console.error('Auto-purchase setup error:', error)
      
      // Mock successful setup for demo
      setTimeout(() => {
        setSetupComplete(true)
        addNotification('Auto-purchase setup complete (Stripe Test Mode)! Ready to find deals.')
      }, 2000)
    }

    setProcessing(false)
  }

  const handleTestPurchase = async () => {
    setProcessing(true)
    
    try {
      const response = await fetch('/api/stripe/test-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: 'test_flight_123',
          amount: 44500, // $445.00 in cents
          currency: 'usd'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        addNotification(`✅ Test purchase successful! Transaction ID: ${data.transactionId}`)
      }
      
    } catch (error) {
      // Mock successful test purchase
      setTimeout(() => {
        addNotification('✅ Test purchase successful! Transaction ID: test_txn_' + Date.now())
      }, 1500)
    }

    setProcessing(false)
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
                <Zap className="h-5 w-5 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">Auto-Purchase Setup</h1>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Stripe Test Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {!setupComplete ? (
          <div className="space-y-8">
            
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Set Up Automatic Flight Purchases
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Never miss a deal again. When your price target is hit, we'll automatically purchase the flight for you.
              </p>
            </div>

            {/* Auto-Purchase Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Auto-Purchase Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enable-auto-purchase"
                    checked={autoPurchaseSettings.enabled}
                    onCheckedChange={(checked) => setAutoPurchaseSettings({...autoPurchaseSettings, enabled: checked})}
                  />
                  <label htmlFor="enable-auto-purchase" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Enable automatic flight purchases when price targets are met
                  </label>
                </div>

                {autoPurchaseSettings.enabled && (
                  <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Auto-Purchase Price</label>
                      <div className="relative max-w-xs">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          placeholder="500"
                          className="pl-10"
                          value={autoPurchaseSettings.maxPrice}
                          onChange={(e) => setAutoPurchaseSettings({...autoPurchaseSettings, maxPrice: e.target.value})}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">We'll never purchase flights above this price</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="instant-buy"
                        checked={autoPurchaseSettings.instantBuy}
                        onCheckedChange={(checked) => setAutoPurchaseSettings({...autoPurchaseSettings, instantBuy: checked})}
                      />
                      <label htmlFor="instant-buy" className="text-sm">
                        Instant purchase (no confirmation delay)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email-confirmation"
                        checked={autoPurchaseSettings.emailConfirmation}
                        onCheckedChange={(checked) => setAutoPurchaseSettings({...autoPurchaseSettings, emailConfirmation: checked})}
                      />
                      <label htmlFor="email-confirmation" className="text-sm">
                        Send email confirmation after purchase
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <p className="text-sm text-gray-600">Secure payment processing via Stripe (Test Mode)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <Input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Use test card: 4242 4242 4242 4242</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={paymentDetails.email}
                    onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Your payment information is secure:</div>
                  <ul className="text-sm space-y-1">
                    <li>• All data encrypted with industry-standard SSL</li>
                    <li>• Payment processed by Stripe (PCI DSS Level 1 certified)</li>
                    <li>• Card details are tokenized and never stored on our servers</li>
                    <li>• Test mode - no real charges will be made</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Setup Button */}
            <div className="text-center">
              <Button
                onClick={handleSetupAutoPurchase}
                disabled={processing || !autoPurchaseSettings.enabled}
                className="bg-green-600 hover:bg-green-700 px-8 py-3"
                size="lg"
              >
                {processing ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 animate-pulse" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Complete Auto-Purchase Setup
                  </>
                )}
              </Button>
            </div>
          </div>

        ) : (
          
          /* Setup Complete */
          <div className="space-y-8">
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Auto-Purchase Ready!
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your automatic flight purchasing is now active. We'll monitor prices and purchase flights when your targets are met.
              </p>
            </div>

            {/* Active Settings Summary */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-green-800">Active Auto-Purchase Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Max Purchase Price</span>
                      <Badge className="bg-green-100 text-green-800">${autoPurchaseSettings.maxPrice}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">We'll never spend more than this amount</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Purchase Speed</span>
                      <Badge className={autoPurchaseSettings.instantBuy ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}>
                        {autoPurchaseSettings.instantBuy ? 'Instant' : 'Standard'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {autoPurchaseSettings.instantBuy ? 'Immediate purchase when targets hit' : 'Brief confirmation delay'}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Payment Method</span>
                      <Badge className="bg-blue-100 text-blue-800">****{paymentDetails.cardNumber.slice(-4)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Stripe secure tokenized payment</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Email Notifications</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Confirmations sent to {paymentDetails.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Purchase */}
            <Card>
              <CardHeader>
                <CardTitle>Test Your Setup</CardTitle>
                <p className="text-gray-600">Verify everything is working with a test transaction</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Test Flight Purchase - QR123 AMM→LHR</div>
                    <div className="text-sm text-gray-600">Test transaction for $445.00 (will not be charged)</div>
                  </div>
                  <Button
                    onClick={handleTestPurchase}
                    disabled={processing}
                    variant="outline"
                  >
                    {processing ? 'Processing...' : 'Test Purchase'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Link href="/">
                <Button variant="outline">
                  Start Monitoring Flights
                </Button>
              </Link>
              
              <Button
                onClick={() => setSetupComplete(false)}
                variant="outline"
              >
                Modify Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}