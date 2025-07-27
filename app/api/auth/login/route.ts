import { type NextRequest, NextResponse } from "next/server"
import { UserStorage } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"
import { ErrorHandler } from "@/lib/error-handler"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt:", { email, passwordLength: password?.length, totalUsers: UserStorage.getUserCount() })

    // Validation
    if (!email || !password) {
      return ErrorHandler.badRequest("Email and password are required")
    }

    // Find user by email
    const user = UserStorage.findUserByEmail(email)
    if (!user) {
      console.log("User not found:", email)
      console.log(
        "Available users:",
        UserStorage.getAllUsers().map((u) => ({ id: u.id, email: u.email })),
      )
      return ErrorHandler.unauthorized("Invalid email or password")
    }

    // Verify password
    const isPasswordValid = await AuthUtils.verifyPassword(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return ErrorHandler.unauthorized("Invalid email or password")
    }

    console.log("Login successful for user:", user.email)

    // Generate JWT token
    const token = AuthUtils.createJWT(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return ErrorHandler.internalError("Login failed", error as Error)
  }
}
