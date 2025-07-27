import { type NextRequest, NextResponse } from "next/server"
import { UserStorage } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"
import { ErrorHandler } from "@/lib/error-handler"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ErrorHandler.unauthorized("Authorization token required")
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded: any
    try {
      decoded = AuthUtils.verifyJWT(token, JWT_SECRET)
    } catch (jwtError) {
      console.log("JWT verification failed:", jwtError)
      return ErrorHandler.unauthorized("Invalid or expired token")
    }

    console.log("Token decoded successfully:", { userId: decoded.userId, email: decoded.email })

    // Find user by ID from token
    const user = UserStorage.findUserById(decoded.userId)
    if (!user) {
      console.log("User not found for ID:", decoded.userId)
      console.log(
        "Available users:",
        UserStorage.getAllUsers().map((u) => ({ id: u.id, email: u.email })),
      )
      return ErrorHandler.notFound("User not found")
    }

    console.log("Protected data accessed by user:", user.email)

    // Return protected user data
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Protected data accessed successfully",
      user: userWithoutPassword,
      tokenInfo: {
        userId: decoded.userId,
        email: decoded.email,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      },
      serverTime: new Date().toISOString(),
      protectedMessage: "This data can only be accessed with a valid JWT token!",
      totalUsers: UserStorage.getUserCount(),
    })
  } catch (error) {
    console.error("Protected route error:", error)
    return ErrorHandler.internalError("Failed to access protected data", error as Error)
  }
}
