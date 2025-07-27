import { type NextRequest, NextResponse } from "next/server"
import { ErrorHandler } from "@/lib/error-handler"

// Mock weather data for different cities
const cityWeatherDatabase: Record<string, any> = {
  "new york": {
    location: "New York, NY",
    temperature: 22,
    description: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
  },
  london: {
    location: "London, UK",
    temperature: 15,
    description: "Rainy",
    humidity: 80,
    windSpeed: 8,
  },
  tokyo: {
    location: "Tokyo, Japan",
    temperature: 28,
    description: "Sunny",
    humidity: 55,
    windSpeed: 5,
  },
  paris: {
    location: "Paris, France",
    temperature: 18,
    description: "Cloudy",
    humidity: 70,
    windSpeed: 10,
  },
  sydney: {
    location: "Sydney, Australia",
    temperature: 25,
    description: "Clear",
    humidity: 60,
    windSpeed: 15,
  },
}

export async function GET(request: NextRequest) {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate occasional API failures for error handling demo
    if (Math.random() < 0.05) {
      // 5% chance of failure
      throw new Error("Weather service temporarily unavailable")
    }

    // Default to New York weather
    const defaultWeather = cityWeatherDatabase["new york"]

    console.log("Default weather data requested successfully")

    return NextResponse.json({
      success: true,
      message: "Weather data retrieved successfully",
      weather: {
        ...defaultWeather,
        temperature: defaultWeather.temperature + Math.floor(Math.random() * 6) - 3, // Random variation ±3°C
        lastUpdated: new Date().toISOString(),
      },
      source: "Mock Weather API",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return ErrorHandler.serviceUnavailable("Weather service is currently unavailable", error as Error)
  }
}

// Enhanced endpoint for different cities
export async function POST(request: NextRequest) {
  try {
    const { city } = await request.json()

    if (!city || typeof city !== "string") {
      return ErrorHandler.badRequest("City name is required and must be a string")
    }

    const cityName = city.toLowerCase().trim()

    if (cityName.length < 2) {
      return ErrorHandler.badRequest("City name must be at least 2 characters long")
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if we have data for this city
    let cityWeatherData = cityWeatherDatabase[cityName]

    if (!cityWeatherData) {
      // Generate random weather data for unknown cities
      cityWeatherData = {
        location: city.charAt(0).toUpperCase() + city.slice(1),
        temperature: 10 + Math.floor(Math.random() * 25), // 10-35°C
        description: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Clear", "Overcast"][Math.floor(Math.random() * 6)],
        humidity: 30 + Math.floor(Math.random() * 50), // 30-80%
        windSpeed: 2 + Math.floor(Math.random() * 20), // 2-22 km/h
      }
    } else {
      // Add some variation to existing city data
      cityWeatherData = {
        ...cityWeatherData,
        temperature: cityWeatherData.temperature + Math.floor(Math.random() * 6) - 3, // ±3°C variation
      }
    }

    console.log(`Weather data requested for city: ${city}`)

    return NextResponse.json({
      success: true,
      message: `Weather data for ${city} retrieved successfully`,
      weather: {
        ...cityWeatherData,
        lastUpdated: new Date().toISOString(),
      },
      source: "Mock Weather API",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return ErrorHandler.internalError("Failed to fetch weather data", error as Error)
  }
}
