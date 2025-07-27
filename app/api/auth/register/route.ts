import { type NextRequest, NextResponse } from "next/server"
import { UserStorage, type User } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"
import { ErrorHandler } from "@/lib/error-handler"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log("Registration attempt:", { name, email, passwordLength: password?.length })

    // Validation
    if (!name || !email || !password) {
      return ErrorHandler.badRequest("All fields are required")
    }

    if (password.length < 6) {
      return ErrorHandler.badRequest("Password must be at least 6 characters")
    }

    // Check if user already exists
    if (UserStorage.userExists(email)) {
      return ErrorHandler.conflict("User already exists with this email")
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password)

    // Create new user
    const newUser: User = {
      id: (UserStorage.getUserCount() + 1).toString(),
      email,
      name,
      password: hashedPassword,
    }

    UserStorage.addUser(newUser)
    console.log("User created successfully:", {
      id: newUser.id,
      email: newUser.email,
      totalUsers: UserStorage.getUserCount(),
    })

    // Generate JWT token
    const token = AuthUtils.createJWT(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
    )

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return ErrorHandler.internalError("Registration failed", error as Error)
  }
}
