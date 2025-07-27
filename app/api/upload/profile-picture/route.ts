import { type NextRequest, NextResponse } from "next/server"
import { UserStorage } from "@/lib/user-storage"
import { AuthUtils } from "@/lib/auth-utils"
import { ErrorHandler } from "@/lib/error-handler"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    console.log("=== File Upload Request Started ===")

    // Verify authentication first
    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ErrorHandler.unauthorized("Authentication required for file upload")
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = AuthUtils.verifyJWT(token, JWT_SECRET)
      console.log("Token decoded successfully for user:", decoded.userId)
    } catch (jwtError) {
      console.log("JWT verification failed:", jwtError)
      return ErrorHandler.unauthorized("Invalid or expired token")
    }

    // Parse form data with detailed logging
    console.log("Attempting to parse form data...")
    let formData: FormData

    try {
      formData = await request.formData()
      console.log("Form data parsed successfully")

      // Log all form data entries
      const entries = Array.from(formData.entries())
      console.log(
        "Form data entries:",
        entries.map(([key, value]) => ({
          key,
          type: typeof value,
          isFile: value instanceof File,
          size: value instanceof File ? value.size : "N/A",
          name: value instanceof File ? value.name : "N/A",
        })),
      )
    } catch (error) {
      console.error("Failed to parse form data:", error)
      return ErrorHandler.badRequest("Invalid form data format")
    }

    // Try different possible field names
    let file = formData.get("profilePicture") as File | null
    if (!file) {
      file = formData.get("file") as File | null
    }
    if (!file) {
      file = formData.get("image") as File | null
    }

    console.log("File extraction result:", {
      found: !!file,
      name: file?.name,
      size: file?.size,
      type: file?.type,
      constructor: file?.constructor.name,
    })

    // Check if file exists and is actually a File object
    if (!file || !(file instanceof File)) {
      console.log("No valid file found in form data")
      return ErrorHandler.badRequest("No file provided. Please select an image file.")
    }

    if (file.size === 0) {
      console.log("File is empty")
      return ErrorHandler.badRequest("Selected file is empty. Please choose a valid image file.")
    }

    console.log("File validation passed:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file
    const validationResult = validateFile(file)
    if (!validationResult.isValid) {
      console.log("File validation failed:", validationResult.error)
      return ErrorHandler.badRequest(validationResult.error!)
    }

    // Find user
    const user = UserStorage.findUserById(decoded.userId)
    if (!user) {
      console.log("User not found:", decoded.userId)
      return ErrorHandler.notFound("User not found")
    }

    console.log("Processing file for user:", user.email)

    // Process file (convert to base64 for storage)
    try {
      const fileBuffer = await file.arrayBuffer()
      const base64File = Buffer.from(fileBuffer).toString("base64")
      const fileUrl = `data:${file.type};base64,${base64File}`

      console.log("File processed successfully, base64 length:", base64File.length)

      // Update user profile
      const updateSuccess = UserStorage.updateUserProfile(decoded.userId, {
        profilePicture: fileUrl,
        lastUpdated: new Date().toISOString(),
      })

      if (!updateSuccess) {
        console.log("Failed to update user profile")
        return ErrorHandler.internalError("Failed to update user profile")
      }

      console.log(`Profile picture uploaded successfully for user: ${user.email}`)

      return NextResponse.json({
        success: true,
        message: "Profile picture uploaded successfully! 🎉",
        fileUrl: fileUrl,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
      })
    } catch (processingError) {
      console.error("File processing error:", processingError)
      return ErrorHandler.internalError("Failed to process uploaded file")
    }
  } catch (error) {
    console.error("=== File Upload Error ===", error)
    return ErrorHandler.internalError("File upload failed", error as Error)
  }
}

function validateFile(file: File): { isValid: boolean; error?: string } {
  console.log("Validating file:", {
    name: file.name,
    size: file.size,
    type: file.type,
  })

  // Check file type
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Only image files are allowed (JPG, PNG, GIF, etc.)" }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Check file name
  if (file.name.length > 100) {
    return { isValid: false, error: "File name is too long (max 100 characters)" }
  }

  console.log("File validation passed")
  return { isValid: true }
}
