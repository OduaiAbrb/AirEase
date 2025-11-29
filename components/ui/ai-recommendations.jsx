'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock, MapPin, Thermometer, Lightbulb, Sparkles, RefreshCw } from "lucide-react"

export function AIRecommendationsCard({ flightData, onRecommendationsGenerated }) {
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/flights/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flightData,
          tripType: 'leisure',
          duration: '3-5 days'
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data)
        onRecommendationsGenerated?.(data)
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    }
    setLoading(false)
  }

  if (!recommendations) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-purple-800">
            <Brain className="h-6 w-6" />
            Gemini AI Travel Assistant
          </CardTitle>
          <p className="text-sm text-gray-600">Get personalized packing and travel recommendations</p>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={generateRecommendations}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Gemini AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { packingRecs, travelTips, timeBudget } = recommendations

  return (
    <div className="space-y-6">
      {/* Weather & Destination Info */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            {packingRecs.destination}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {packingRecs.weather.temp}°C
            </Badge>
            <span className="text-sm text-gray-600">{packingRecs.weather.condition}</span>
            {packingRecs.geminiAI && (
              <Badge className="bg-green-100 text-green-800">
                <Brain className="h-3 w-3 mr-1" />
                Gemini AI
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Packing Recommendations */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            🎒 Smart Packing Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">👔 Clothing</h4>
              <ul className="text-sm space-y-1">
                {packingRecs.recommendations.clothing?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🌦️ Weather Items</h4>
              <ul className="text-sm space-y-1">
                {packingRecs.recommendations.weather?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎒 Essentials</h4>
              <ul className="text-sm space-y-1">
                {packingRecs.recommendations.essentials?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Pro Tip</h4>
                <p className="text-sm text-yellow-700">{packingRecs.recommendations.tip}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Budget */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Clock className="h-5 w-5" />
            Smart Time Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-2xl font-bold text-orange-600">
              Leave by: {timeBudget.leaveByTime}
            </div>
            <div className="text-sm text-gray-600">
              Total travel time: {timeBudget.totalMinutes} minutes
            </div>
          </div>
          
          <div className="space-y-2">
            {timeBudget.timeBudget?.map((segment, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded">
                <span className="text-sm">{segment.name}</span>
                <Badge variant="outline" className="text-orange-700">
                  {segment.minutes} min
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Travel Tips */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            💡 Local Travel Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {travelTips.tips?.map((tip, index) => (
              <div key={index} className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                <h4 className="font-semibold text-indigo-800 text-sm">{tip.category}</h4>
                <p className="text-sm text-indigo-700 mt-1">{tip.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={generateRecommendations}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>
    </div>
  )
}

export default AIRecommendationsCard