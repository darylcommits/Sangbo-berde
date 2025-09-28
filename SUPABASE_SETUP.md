# SANGBO BERDE - Supabase Setup Guide

## 🚀 Real Database Setup (No Demo Mode)

To get the real application working, you need to set up Supabase:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name:** `sangbo-berde`
   - **Database Password:** (choose a strong password)
   - **Region:** Choose closest to your location

## 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the schema from `src/lib/supabase.js`
3. Run the SQL to create all tables and policies

## 4. Enable Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** authentication
3. Configure your site URL (e.g., `http://localhost:5173`)

## 5. Test the Application

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Create a new account or sign in
4. Test all features with real data

## 🔧 Database Schema

The application includes these main tables:
- **profiles** - User profiles with roles
- **attendance** - Staff check-in/out records
- **tasks** - Work assignments
- **routes** - Collection routes
- **collection_logs** - Waste collection data
- **compost_operations** - Facility operations
- **citizen_reports** - Community reports
- **notifications** - System alerts
- **sustainability_metrics** - Environmental data

## 🎯 User Roles

- **admin** - Full system access
- **supervisor** - Workforce management
- **collector** - Field worker interface
- **facility_staff** - Compost operations
- **citizen** - Community reporting

## 📱 Features

### Admin Dashboard
- Real-time analytics
- Staff performance tracking
- Sustainability metrics
- System management

### Mobile Interface
- GPS location tracking
- QR code scanning
- Task management
- Real-time notifications

### Citizen Portal
- Report missed collections
- Submit environmental complaints
- Track report status
- Community engagement

## 🚨 Troubleshooting

### "must be owner of table users" Error
- This is fixed in the current code
- The schema no longer tries to modify `auth.users`

### Environment Variables Not Loading
- Make sure `.env` file is in the project root
- Restart the development server after adding variables
- Check that variable names start with `VITE_`

### Authentication Issues
- Verify Supabase URL and key are correct
- Check that authentication is enabled in Supabase
- Ensure site URL is configured properly

## 🎉 Success!

Once configured, you'll have a fully functional waste management system with:
- Real user authentication
- Persistent data storage
- Role-based access control
- Mobile-responsive interface
- Real-time features

---

**Ready to make a real impact on waste management! 🌱**
