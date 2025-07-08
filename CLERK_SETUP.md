# Clerk.js Authentication Setup

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk.js Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Admin User Configuration
# Replace with your actual Clerk user ID to make them an admin
ADMIN_USER_ID=user_your_clerk_user_id_here

# Database Configuration
DATABASE_URL="file:./dev.db"
```

## Setup Steps

1. **Create a Clerk Account**
   - Go to [clerk.com](https://clerk.com) and create an account
   - Create a new application
   - Copy your publishable key and secret key

2. **Configure Admin User**
   - Sign up/sign in to your application
   - Go to your Clerk dashboard
   - Find your user ID in the Users section
   - Copy the user ID and set it as `ADMIN_USER_ID` in your `.env.local`

3. **Database Setup**
   - Run `pnpm prisma generate` to generate Prisma client
   - Run `pnpm prisma db push` to create the database
   - Run `pnpm prisma db seed` to seed initial data

4. **Enable Clerk.js Middleware**
   - Once your environment is configured, rename `middleware.clerk.ts` to `middleware.ts`
   - This will enable full Clerk.js authentication and route protection

## How It Works

### Role Assignment
- When a user signs in via Clerk, the system checks if their `userId` matches `ADMIN_USER_ID`
- If it matches, they are assigned the `ADMIN` role
- Otherwise, they are assigned the `STUDENT` role by default

### Route Protection
- `/admin/*` routes are protected and only accessible to admin users
- Non-admin users are redirected to the home page when trying to access admin routes
- All other routes require authentication but are role-agnostic

### API Protection
- All API routes use the `requireAuth()` function to ensure authentication
- Admin-specific routes use `requireRole(Role.ADMIN)` for additional protection

### Fallback Authentication
- If Clerk.js is not configured, the system falls back to a mock user for development
- This allows development to continue without full Clerk.js setup

## Usage Examples

```typescript
// Check if current user is admin
import { isCurrentUserAdmin } from "@/lib/auth"

const isAdmin = await isCurrentUserAdmin()

// Require admin role for API routes
import { requireAdmin } from "@/lib/auth"

export async function POST(request: Request) {
  const user = await requireAdmin()
  // ... rest of the code
}

// Get current user with role
import { getCurrentUser } from "@/lib/auth"

const user = await getCurrentUser()
console.log(user.role) // "ADMIN" | "TEACHER" | "STUDENT"
```

## Middleware Configuration

### Current Setup (Development)
The current `middleware.ts` allows all requests for development purposes.

### Production Setup (With Clerk.js)
To enable full Clerk.js authentication:

1. **Rename the middleware file:**
   ```bash
   mv middleware.clerk.ts middleware.ts
   ```

2. **Restart your development server:**
   ```bash
   pnpm dev
   ```

3. **Verify the setup:**
   - Visit `/sign-in` to see the Clerk.js sign-in page
   - Try accessing `/admin/dashboard` without authentication
   - You should be redirected to sign-in

## Troubleshooting

### "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"
This error occurs when Clerk.js functions are called without proper middleware setup.

**Solution:**
1. Ensure your `.env.local` has the correct Clerk.js keys
2. Rename `middleware.clerk.ts` to `middleware.ts`
3. Restart your development server

### "Property 'userId' does not exist on type 'ClerkMiddlewareAuth'"
This is a TypeScript issue with Clerk.js v6.23.3.

**Solution:**
The middleware in `middleware.clerk.ts` uses the correct API for this version.

### Development Without Clerk.js
If you want to develop without setting up Clerk.js:

1. Keep the current `middleware.ts` (allows all requests)
2. The system will use mock authentication
3. You can still test role-based functionality

## Security Notes

- The `ADMIN_USER_ID` should be kept secret and not committed to version control
- Only one user can be admin at a time (configured via environment variable)
- All role checks happen server-side for security
- Client-side role checks are for UI purposes only
- The fallback mock user is only for development and should not be used in production 