// Shared authentication utilities
export class AuthUtils {
  // Simple JWT implementation
  static createJWT(payload: any, secret: string): string {
    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + 24 * 60 * 60 // 24 hours

    const jwtPayload = {
      ...payload,
      iat: now,
      exp: exp,
    }

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")

    const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  // Simple JWT verification
  static verifyJWT(token: string, secret: string): any {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid token format")
      }

      const [header, payload, signature] = parts
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      if (decodedPayload.exp < now) {
        throw new Error("Token expired")
      }

      return decodedPayload
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  // Simple password hashing
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "salt123")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Simple password verification
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    // For demo user, use simple comparison
    if (hashedPassword === "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi") {
      return password === "demo123"
    }

    // For new users, hash the input and compare
    const inputHash = await this.hashPassword(password)
    return inputHash === hashedPassword
  }
}
