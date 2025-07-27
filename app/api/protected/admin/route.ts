import { type NextRequest, NextResponse } from "next/server"
import { UserStorage } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    let decoded: any
    try {
      decoded = AuthUtils.verifyJWT(token, JWT_SECRET)
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    // Simulate admin-only data
    return NextResponse.json({
      success: true,
      message: "Admin data accessed successfully",
      adminData: {
        totalUsers: UserStorage.getUserCount(),
        systemStatus: "operational",
        lastBackup: new Date().toISOString(),
        serverMetrics: {
          cpuUsage: "45%",
          memoryUsage: "62%",
          diskSpace: "78%",
        },
        registeredUsers: UserStorage.getAllUsers().map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
        })),
      },
      accessedBy: {
        userId: decoded.userId,
        email: decoded.email,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Admin route error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
