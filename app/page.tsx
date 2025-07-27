"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { LogOut, Shield, Lock, Upload, User, Cloud, MapPin, Thermometer } from "lucide-react"

interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: any
}

interface WeatherData {
  location: string
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  lastUpdated: string
}

export default function AuthApp() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [protectedData, setProtectedData] = useState<any>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCity, setSelectedCity] = useState("New York")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchWeatherForCity = async () => {
    if (!selectedCity.trim()) {
      showMessage("Please enter a city name", "error")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/third-party/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: selectedCity.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setWeatherData(data.weather)
        showMessage(`Weather updated for ${selectedCity}! 🌤️`, "success")
      } else {
        showMessage(data.message || "Failed to fetch weather data", "error")
      }
    } catch (error) {
      showMessage("Failed to fetch weather data. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
      // Fetch weather data for logged in user
      fetchWeatherData()
    }
  }, [])

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("File selected:", {
      hasFile: !!file,
      name: file?.name,
      size: file?.size,
      type: file?.type,
    })

    if (file) {
      // Validate file type and size on frontend
      if (!file.type.startsWith("image/")) {
        showMessage("Please select an image file (JPG, PNG, GIF, etc.)", "error")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showMessage(
          `File size must be less than 5MB. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          "error",
        )
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
      setSelectedFile(file)
      showMessage(`File selected: ${file.name}`, "success")
    }
  }

  const handleFileUpload = async () => {
    console.log("=== Upload Started ===")
    console.log("Selected file:", selectedFile)

    if (!selectedFile) {
      showMessage("Please select a file first", "error")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      showMessage("Please login first", "error")
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      // Create FormData and append file
      const formData = new FormData()
      formData.append("profilePicture", selectedFile)

      console.log("FormData created with file:", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log("Making upload request...")
      const response = await fetch("/api/upload/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Upload response status:", response.status)
      const data = await response.json()
      console.log("Upload response data:", data)

      if (data.success) {
        // Update user data with new profile picture
        const updatedUser = { ...user, profilePicture: data.fileUrl }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        showMessage("Profile picture uploaded successfully! 🎉", "success")
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        showMessage(data.message || "Upload failed", "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      showMessage("Upload failed. Please check your connection and try again.", "error")
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const fetchWeatherData = async () => {
    try {
      const response = await fetch("/api/third-party/weather")
      const data = await response.json()

      if (data.success) {
        setWeatherData(data.weather)
      }
    } catch (error) {
      console.error("Failed to fetch weather data:", error)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data: AuthResponse = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        showMessage("Registration successful! Welcome aboard! 🎉", "success")
        fetchWeatherData()
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Registration failed. Please check your connection and try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const loginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data: AuthResponse = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        showMessage("Welcome back! Great to see you again! 👋", "success")
        fetchWeatherData()
      } else {
        showMessage(data.message, "error")
      }
    } catch (error) {
      showMessage("Login failed. Please check your connection and try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setProtectedData(null)
    setWeatherData(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    showMessage("Thanks for using our app! See you soon! 👋", "success")
  }

  const fetchProtectedData = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      showMessage("Please login first to access this feature", "error")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/protected/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setProtectedData(data)
        showMessage("Protected data loaded successfully! 🔒", "success")
      } else {
        showMessage(data.message || "Failed to fetch protected data", "error")
      }
    } catch (error) {
      showMessage("Network error. Please check your connection.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    <span>Welcome back, {user.name}!</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage your account and explore features</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </CardHeader>
          </Card>

          {/* Message Alert */}
          {message && (
            <Alert className={messageType === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
              <AlertDescription className={messageType === "error" ? "text-red-700" : "text-green-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Management</span>
                </CardTitle>
                <CardDescription>Update your profile picture and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="secondary">ID: {user.id}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="profile-picture">Upload Profile Picture</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={fileInputRef}
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    <Button onClick={handleFileUpload} disabled={!selectedFile || loading} size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  {selectedFile && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <p>
                        <strong>Selected:</strong> {selectedFile.name}
                      </p>
                      <p>
                        <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p>
                        <strong>Type:</strong> {selectedFile.type}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5" />
                  <span>Weather Information</span>
                </CardTitle>
                <CardDescription>Current weather data from third-party API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* City Selection */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter city name..."
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={fetchWeatherForCity} disabled={loading || !selectedCity.trim()} size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Weather
                    </Button>
                  </div>

                  {weatherData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{weatherData.location}</span>
                        </div>
                        <Badge variant="outline">{weatherData.description}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span>{weatherData.temperature}°C</span>
                        </div>
                        <div className="text-sm text-gray-600">Humidity: {weatherData.humidity}%</div>
                        <div className="text-sm text-gray-600" colSpan={2}>
                          Wind: {weatherData.windSpeed} km/h
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(weatherData.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Cloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Enter a city name to get weather information</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Protected Route Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Protected Data Access</span>
              </CardTitle>
              <CardDescription>Test secure API endpoints with JWT authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchProtectedData} disabled={loading} className="w-full sm:w-auto">
                {loading ? "Loading..." : "Fetch Protected Data"}
              </Button>

              {protectedData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🔒 Protected Data Response:</h4>
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(protectedData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Enhanced JWT Auth</h1>
          <p className="text-gray-600">Secure API with Advanced Features</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={messageType === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
            <AlertDescription className={messageType === "error" ? "text-red-700" : "text-green-700"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Forms */}
        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>Sign in to access your account and explore new features</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input id="login-email" name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Join Us Today!</CardTitle>
                <CardDescription>Create your account and start exploring amazing features</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input id="register-name" name="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <Input id="register-email" name="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>🚀 Try Demo Account:</strong>
              </p>
              <p>Email: demo@example.com</p>
              <p>Password: demo123</p>
              <p className="text-xs text-blue-600 mt-2">
                Or create a new account to test all features including file upload and weather integration!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
