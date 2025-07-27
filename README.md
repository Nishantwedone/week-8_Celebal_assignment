# JWT Authentication System With File Uploading Function And Weather APIs

A complete JWT authentication system built with Next.js, featuring secure token handling, user registration/login, and protected routes.Also Add File upload facility and weather APIs integrated.

## Features

- **User Registration & Login**: Complete authentication flow with form validation
- **JWT Token Management**: Secure token generation, verification, and storage
- **Protected Routes**: API endpoints that require valid JWT tokens
- **Password Security**: Bcrypt hashing for secure password storage
- **Responsive UI**: Modern interface built with Tailwind CSS and shadcn/ui
- **Error Handling**: Comprehensive error handling and user feedback
- **Token Expiration**: Automatic token expiration and validation

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Routes
- `GET /api/protected/profile` - Get user profile (requires JWT)
- `GET /api/protected/admin` - Admin data (requires JWT)

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds for secure password storage
2. **JWT Tokens**: Signed tokens with expiration (24 hours)
3. **Authorization Headers**: Bearer token authentication
4. **Input Validation**: Server-side validation for all inputs
5. **Error Messages**: Generic error messages to prevent information leakage

## Demo Credentials

- **Email**: demo@example.com
- **Password**: demo123

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with:

\`\`\`
JWT_SECRET=your-super-secret-jwt-key-change-in-production
\`\`\`

## Production Considerations

- Replace in-memory storage with a proper database
- Use environment variables for JWT secret
- Implement rate limiting
- Add HTTPS in production
- Consider refresh tokens for better security
- Add input sanitization
- Implement proper logging
- Add CORS configuration

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Icons**: Lucide React

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── protected/
│   │       ├── profile/route.ts
│   │       └── admin/route.ts
│   └── page.tsx
├── components/ui/
└── README.md
\`\`\`

This project demonstrates a complete JWT authentication system suitable for internship projects and learning purposes.
# week-8_Celebal_assignment
