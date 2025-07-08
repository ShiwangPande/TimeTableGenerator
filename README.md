# TimeTable Generator

A modern, feature-rich timetable management system built with Next.js, TypeScript, and Clerk authentication. **100% Free - No paid services required!**

## 🚀 Features

### ✅ Core Features
- **AM/PM time-slot support** - 12-hour format with AM/PM selection
- **Bulk "one-day to all days" entry** - Apply time slots to all weekdays
- **No Saturday/Sunday rows** - Monday-Friday only schedule
- **Excel download (.xlsx)** - Export timetables to Excel format
- **Print-friendly view** - Optimized for printing timetables
- **Dropdown filters** - Filter by class, teacher, curriculum
- **Grade- and teacher-based generation** - Smart timetable generation
- **Teacher→many grades logic** - Support for teachers teaching multiple grades
- **Full Mon–Fri grid view** - Complete weekly timetable display
- **Drag-and-drop slot swapping** - Interactive timetable editing
- **Class sections support** - Multiple sections per class
- **Year calendar sidebar** - Academic calendar integration
- **Color-coding per subject** - Visual subject differentiation
- **Multi-subject per slot** - Multiple subjects in single time slots
- **IB HL/SL & "Individuals & Societies" filter** - IB curriculum support
- **IB filtering (HL/SL, subject groups)** - Advanced filtering for IB subjects
- **Calendar event blocking** - Timetable generation respects holidays/exams
- **User management (roles)** - Admins can view and change user roles
- **Notification badge for swap requests** - Visual notification for pending swaps
- **Student/teacher onboarding** - Guided onboarding for new users

### 🎨 UI/UX Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Toggle between light and dark themes
- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **Real-time Updates** - Live timetable changes
- **Loading States** - Smooth user experience
- **Error Handling** - Comprehensive error management

### 🔐 Authentication & Authorization
- **Clerk.js Integration** - Secure authentication (free tier available)
- **Role-based Access Control** - Admin, Teacher, Student roles
- **Social Login Support** - Google, Microsoft OAuth (free)
- **Email Verification** - Secure account verification

### 📧 Notifications & Integrations
- **Email Notifications** - Free Gmail SMTP integration
- **In-App Notifications** - Real-time updates within the app
- **Swap Request System** - Teacher-to-teacher slot swapping
- **Export Features** - Excel, PDF, and print formats

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk.js (free tier)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hook Form + Zod
- **Drag & Drop**: React DnD
- **Charts**: Recharts
- **Email**: Nodemailer with Gmail SMTP (free)
- **Deployment**: Vercel (free tier available)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd timetable-generator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Clerk.js Configuration (Free tier)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ADMIN_USER_ID=user_your_clerk_user_id_here

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/timetable_db"

   # Email Configuration (Optional - Free Gmail SMTP)
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma db seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Clerk.js Setup (Free)
1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application (free tier includes 5,000 monthly active users)
3. Copy your publishable key and secret key
4. Add them to your `.env.local` file
5. Configure your admin user ID

### Database Setup
1. Set up a PostgreSQL database (free options: Railway, Supabase, Neon)
2. Update the `DATABASE_URL` in your `.env.local`
3. Run the Prisma migrations

### Email Notifications (Free Gmail SMTP)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for this application
3. Add your Gmail credentials to `.env.local`
4. In development, emails are logged to console

## 🚀 Deployment

### Vercel (Free Tier)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy! (Free tier includes 100GB bandwidth/month)

### Other Free Platforms
- **Railway** - Free tier with $5 credit
- **Render** - Free tier available
- **Netlify** - Free tier with 100GB bandwidth
- **Supabase** - Free PostgreSQL database

## 📱 Usage

### Admin Role
- Manage classes, teachers, subjects, and rooms
- Generate timetables automatically
- Export timetables to Excel
- Print timetables
- Manage user roles and permissions

### Teacher Role
- View assigned timetables
- Request slot swaps with other teachers
- Receive email notifications for changes
- Export personal timetables

### Student Role
- View class timetables
- Filter by subjects and teachers
- Print personal timetables

## 🎨 Customization

### Branding
Update the colors in `tailwind.config.ts`:
```typescript
school: {
  primary: "#1e40af", // Your school's primary color
  secondary: "#059669", // Your school's secondary color
  // ... other colors
}
```

### Logo
Replace the logo in `components/ui/logo.tsx` with your school's logo.

### Email Templates
Customize email templates in `lib/notifications.ts`.

## 🗺️ Application Flow & Roles

Below is a high-level overview of how users flow through the application based on their role:

```mermaid
graph TD
  A[Sign In] --> B{Role}
  B -->|Admin| C[Admin Dashboard]
  B -->|Teacher| D[Teacher Timetable]
  B -->|Student| E[Student Timetable]
  C --> F[User Management]
  C --> G[Class/Room/Subject Management]
  D --> H[View Subjects/Request Swaps]
  E --> I[View Class Timetable]
```

### Role-Based Access & Navigation
- **Admin:** Full access to all management features, user roles, timetable generation, and analytics.
- **Teacher:** Access to their own timetable, assigned subjects, and swap requests.
- **Student:** Access to their class timetable and related info.
- **Automatic Redirects:** After sign-in, users are redirected to their role's dashboard.
- **Strict Access Control:** All sensitive pages and API routes are protected by role checks.

### Role Summary Table

| Role    | Landing Page           | Permissions                                      | Key Features                        |
|---------|------------------------|--------------------------------------------------|-------------------------------------|
| Admin   | /admin/dashboard       | All management, user/role control                | User mgmt, timetable gen, analytics |
| Teacher | /teacher/timetable     | Own timetable, request swaps, view subjects      | Timetable, swap requests            |
| Student | /student/timetable     | Own class timetable                              | Timetable, class info               |

## 💰 Cost Breakdown

**Total Cost: $0/month**

- **Clerk.js**: Free tier (5,000 MAU)
- **Vercel**: Free tier (100GB bandwidth)
- **PostgreSQL**: Free on Railway/Supabase/Neon
- **Email**: Free Gmail SMTP
- **All other services**: Open source/free

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please:
1. Check the [documentation](link-to-docs)
2. Search existing [issues](link-to-issues)
3. Create a new issue with detailed information

## 🔮 Roadmap

- [ ] Multi-tenant support (multiple schools)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with school management systems
- [ ] Parent portal for viewing child's timetable
- [ ] Advanced conflict detection
- [ ] Automated timetable optimization
- [ ] Multi-language support
- [ ] Offline support with PWA
- [ ] Advanced export formats (CSV, JSON)

## 🛠️ Troubleshooting

- If you add new schema features (e.g., IB filtering, AcademicEvent), be sure to run the latest Prisma migration:
  ```bash
  pnpm prisma migrate dev
  pnpm prisma db seed
  ```
- If you see errors about missing tables or constraints, check your migration status. #   T i m e T a b l e G e n e r a t o r  
 