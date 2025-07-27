import { NextResponse } from "next/server"

export class ErrorHandler {
  // 400 Bad Request
  static badRequest(message: string, details?: any) {
    console.error("Bad Request:", message, details)
    return NextResponse.json(
      {
        success: false,
        error: "Bad Request",
        message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: details || null,
      },
      { status: 400 },
    )
  }

  // 401 Unauthorized
  static unauthorized(message = "Authentication required") {
    console.error("Unauthorized:", message)
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    )
  }

  // 403 Forbidden
  static forbidden(message = "Access denied") {
    console.error("Forbidden:", message)
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
      },
      { status: 403 },
    )
  }

  // 404 Not Found
  static notFound(message = "Resource not found") {
    console.error("Not Found:", message)
    return NextResponse.json(
      {
        success: false,
        error: "Not Found",
        message,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    )
  }

  // 409 Conflict
  static conflict(message: string) {
    console.error("Conflict:", message)
    return NextResponse.json(
      {
        success: false,
        error: "Conflict",
        message,
        statusCode: 409,
        timestamp: new Date().toISOString(),
      },
      { status: 409 },
    )
  }

  // 422 Unprocessable Entity
  static validationError(message: string, errors: any[] = []) {
    console.error("Validation Error:", message, errors)
    return NextResponse.json(
      {
        success: false,
        error: "Validation Error",
        message,
        statusCode: 422,
        timestamp: new Date().toISOString(),
        validationErrors: errors,
      },
      { status: 422 },
    )
  }

  // 500 Internal Server Error
  static internalError(message = "Internal server error", error?: Error) {
    console.error("Internal Server Error:", message, error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === "development" && {
          stack: error?.stack,
          errorDetails: error?.message,
        }),
      },
      { status: 500 },
    )
  }

  // 503 Service Unavailable
  static serviceUnavailable(message = "Service temporarily unavailable", error?: Error) {
    console.error("Service Unavailable:", message, error)
    return NextResponse.json(
      {
        success: false,
        error: "Service Unavailable",
        message,
        statusCode: 503,
        timestamp: new Date().toISOString(),
        retryAfter: "60 seconds",
      },
      { status: 503 },
    )
  }

  // Rate Limiting
  static rateLimited(message = "Too many requests") {
    console.error("Rate Limited:", message)
    return NextResponse.json(
      {
        success: false,
        error: "Rate Limited",
        message,
        statusCode: 429,
        timestamp: new Date().toISOString(),
        retryAfter: "60 seconds",
      },
      { status: 429 },
    )
  }
}
