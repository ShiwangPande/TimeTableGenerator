# Timetable Generator Setup Guide

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timetable-generator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/timetable_generator"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ADMIN_USER_ID=your_admin_user_id_here
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma migrate dev   # Run this for new schema features (IB, AcademicEvent, etc.)
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

## Environment Variables

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key

### Optional Variables
- `ADMIN_USER_ID`: Admin user ID for development
- `GMAIL_USER`: Gmail address for notifications
- `GMAIL_APP_PASSWORD`: Gmail app password for notifications
- `NODE_ENV`: Environment (development/production)

## Database Setup

### PostgreSQL Setup
1. Install PostgreSQL
2. Create a database: `createdb timetable_generator`
3. Update `DATABASE_URL` in `.env.local`

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations (if using migrations)
npx prisma migrate dev

# Seed the database
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

## Authentication Setup (Clerk)

1. **Create a Clerk account** at [clerk.com](https://clerk.com)
2. **Create a new application**
3. **Get your API keys** from the Clerk dashboard
4. **Add the keys to your `.env.local` file**

### Clerk Configuration
- Add your domain to allowed origins in Clerk dashboard
- Configure sign-in methods (email, Google, etc.)
- Set up user roles if needed

## Common Issues and Fixes

### 1. Database Connection Issues
**Error**: `Connection refused` or `Database does not exist`
**Fix**: 
- Check your `DATABASE_URL` format
- Ensure PostgreSQL is running
- Create the database if it doesn't exist

### 2. Authentication Issues
**Error**: `Clerk configuration error`
**Fix**:
- Verify Clerk API keys are correct
- Check that keys are in the right environment variables
- Ensure domain is added to Clerk allowed origins

### 3. Swap Request Issues
**Error**: `Failed to create swap request`
**Fix**:
- Check that both teachers exist in the database
- Verify timetable entries exist
- Check console for detailed error messages

### 4. Email Notification Issues
**Error**: `Failed to send email notification`
**Fix**:
- Email notifications are optional and won't break the app
- Check Gmail credentials if configured
- Notifications are logged to console in development

### 5. TypeScript Errors
**Error**: TypeScript compilation errors
**Fix**:
- Run `npm run build` to see all errors
- Check for missing imports
- Verify all API endpoints exist

### 6. Build Errors
**Error**: Build fails
**Fix**:
- Check `next.config.mjs` for proper configuration
- Ensure all dependencies are installed
- Clear `.next` folder and rebuild

## Development Workflow

### 1. Making Changes
1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Run `npm run build` to check for errors
5. Commit and push

### 2. Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Update seed data if needed

### 3. API Changes
1. Create/update API routes in `app/api/`
2. Test with Postman or similar tool
3. Update frontend components if needed

## Testing

### Manual Testing Checklist
- [ ] Admin can create teachers, classes, subjects
- [ ] Admin can generate timetables
- [ ] Admin can swap timetable entries directly
- [ ] Teachers can view their timetable
- [ ] Teachers can request swaps with other teachers
- [ ] Teachers can approve/reject swap requests
- [ ] Students can view their class timetable
- [ ] Email notifications work (if configured)

### API Testing
Test these endpoints:
- `GET /api/teachers` - List teachers
- `GET /api/classes` - List classes
- `GET /api/subjects` - List subjects
- `GET /api/timetable` - Get timetable
- `POST /api/timetable/swap` - Create swap request
- `PUT /api/timetable/swap` - Update swap request
- `GET /api/teacher/export/excel` - Teacher Excel export
- `GET /api/student/export/excel` - Student Excel export
- `GET /api/teacher/export/all` - All-in-one ZIP export
- `GET /api/student/export/pdf` - Student PDF export
- `GET /api/teacher/export/pdf` - Teacher PDF export
- `GET /api/student/export/summary` - Student summary export
- `GET /api/teacher/export/summary` - Teacher summary export

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure PostgreSQL database is accessible
- Set all required environment variables
- Configure Clerk for production domain

## Troubleshooting

### Check Logs
- Development: Check terminal output
- Production: Check platform logs
- Database: Use `npx prisma studio`

### Common Commands
```bash
# Reset database
npx prisma db push --force-reset
npm run db:seed

# Clear Next.js cache
rm -rf .next
npm run dev

# Check Prisma status
npx prisma db pull
npx prisma generate

# View database
npx prisma studio
```

### Getting Help
1. Check this guide first
2. Look at console errors
3. Check network tab in browser dev tools
4. Verify environment variables
5. Test API endpoints directly

## Features Overview

### Admin Features
- Create/manage teachers, classes, subjects
- Generate timetables automatically
- Direct timetable entry swapping
- View all swap requests (with notification badge)
- Export timetables
- Manage user roles and permissions (user management page)

### Teacher Features
- View complete timetable
- Request swaps with other teachers
- Approve/reject swap requests
- Track swap request history
- Email notifications
- Download/export timetable in multiple formats

### Student Features
- View class timetable
- Academic calendar
- Filter by class/curriculum/IB group/level
- Onboarding flow for new students (class selection)

## Security Notes

- All API routes are protected with authentication
- Role-based access control implemented
- Teachers can only swap their own subjects
- Admin can perform all operations
- Students have read-only access

---

**Need Help?** Check the console for error messages and ensure all environment variables are set correctly. 