// Shared user storage that persists across API routes
interface User {
  id: string
  email: string
  name: string
  password: string
  profilePicture?: string
  lastUpdated?: string
}

// In-memory storage (in production, use a database)
const users: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    name: "Demo User",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // demo123
  },
]

export class UserStorage {
  static getAllUsers(): User[] {
    return users
  }

  static findUserByEmail(email: string): User | undefined {
    return users.find((user) => user.email === email)
  }

  static findUserById(id: string): User | undefined {
    return users.find((user) => user.id === id)
  }

  static addUser(user: User): void {
    users.push(user)
    console.log("User added to storage:", { id: user.id, email: user.email, totalUsers: users.length })
  }

  static getUserCount(): number {
    return users.length
  }

  static userExists(email: string): boolean {
    return users.some((user) => user.email === email)
  }

  static updateUserProfile(
    userId: string,
    updates: Partial<User & { profilePicture?: string; lastUpdated?: string }>,
  ): boolean {
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      console.log("User not found for profile update:", userId)
      return false
    }

    // Merge updates with existing user data
    users[userIndex] = { ...users[userIndex], ...updates } as User
    console.log("User profile updated successfully:", {
      userId,
      updatedFields: Object.keys(updates),
      hasProfilePicture: !!updates.profilePicture,
    })
    return true
  }
}

export type { User }
