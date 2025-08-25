'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  isOutdoor: boolean
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun className="text-yellow-500" size={24} />
    case 'cloudy':
    case 'overcast':
      return <Cloud className="text-gray-500" size={24} />
    case 'rainy':
    case 'rain':
      return <CloudRain className="text-blue-500" size={24} />
    case 'snowy':
    case 'snow':
      return <CloudSnow className="text-blue-300" size={24} />
    case 'windy':
      return <Wind className="text-gray-400" size={24} />
    default:
      return <Cloud className="text-gray-500" size={24} />
  }
}

const getTrainingRecommendation = (weatherData: WeatherData) => {
  if (weatherData.condition.toLowerCase().includes('rain') || 
      weatherData.condition.toLowerCase().includes('snow')) {
    return 'Indoor training recommended'
  }
  if (weatherData.temperature < 40) {
    return 'Bundle up for outdoor training'
  }
  if (weatherData.temperature > 85) {
    return 'Stay hydrated, consider indoor training'
  }
  if (weatherData.windSpeed > 20) {
    return 'High winds - indoor training preferred'
  }
  return 'Perfect weather for outdoor training!'
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate weather API call with demo data
    const fetchWeather = async () => {
      setIsLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo weather data - in real app this would come from a weather API
      const demoWeather: WeatherData = {
        temperature: 72,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 8,
        isOutdoor: true
      }
      
      setWeather(demoWeather)
      setIsLoading(false)
    }

    fetchWeather()
  }, [])

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center mb-4">
          <Thermometer className="text-blue-600 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-secondary-900">Weather</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  const recommendation = getTrainingRecommendation(weather)

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Thermometer className="text-blue-600 mr-3" size={24} />
        <h2 className="text-xl font-semibold text-secondary-900">Weather</h2>
      </div>
      
      <div className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <p className="text-2xl font-bold text-secondary-900">{weather.temperature}°F</p>
              <p className="text-sm text-secondary-600">{weather.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-secondary-600">Humidity: {weather.humidity}%</p>
            <p className="text-sm text-secondary-600">Wind: {weather.windSpeed} mph</p>
          </div>
        </div>

        {/* Training Recommendation */}
        <div className="p-3 bg-secondary-50 rounded-lg">
          <p className="text-sm font-medium text-secondary-900 mb-1">Training Recommendation</p>
          <p className="text-sm text-secondary-700">{recommendation}</p>
        </div>

        {/* Quick Weather Check */}
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            Check hourly
          </button>
          <button className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
            Weekend forecast
          </button>
        </div>
      </div>
    </div>
  )
}
