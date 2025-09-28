# SANGBO BERDE: City-Scale Composting Facility Management System

A comprehensive web and mobile application designed to streamline workforce coordination, task assignments, and operational efficiency in municipal composting facilities. This system integrates HR functions (attendance, task tracking, accountability) with real-time waste collection and composting operations.

## 🌱 Features

### For Administrators & Supervisors
- **Dashboard Overview**: Real-time metrics and operational insights
- **Workforce Management**: Staff directory, attendance tracking, performance monitoring
- **Task Management**: Create, assign, and track tasks for staff members
- **Reports & Analytics**: Citizen reports management and sustainability tracking
- **Settings**: User profile management and system configuration

### For Staff (Collectors & Facility Workers)
- **Mobile Interface**: Optimized for mobile devices
- **Attendance Tracking**: Check-in/check-out with GPS location
- **Task Management**: View and update assigned tasks
- **Notifications**: Real-time alerts and updates
- **Profile Management**: Personal information and settings

### For Citizens
- **Issue Reporting**: Report missed collections, illegal dumping, and environmental complaints
- **Community Portal**: Access to compost products and eco-tips
- **Status Tracking**: Monitor report resolution progress

## 🚀 Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Heroicons
- **Routing**: React Router DOM
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd sangbo-berde
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run the SQL schema from `src/lib/supabase.js` in your Supabase SQL editor:

```sql
-- Copy and paste the createDatabaseSchema function content
-- This will create all necessary tables and RLS policies
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

The system uses the following main tables:

- **profiles**: User information and roles
- **attendance**: Staff check-in/check-out records
- **tasks**: Task assignments and tracking
- **routes**: Collection routes and schedules
- **collection_logs**: Waste collection records
- **compost_operations**: Composting process tracking
- **citizen_reports**: Community reports and complaints
- **notifications**: System notifications
- **sustainability_metrics**: Environmental impact data

## 👥 User Roles

1. **Admin**: Full system access, user management
2. **Supervisor**: Workforce management, task assignment
3. **Collector**: Mobile interface, task execution
4. **Facility Staff**: Composting operations, mobile interface
5. **Citizen**: Reporting issues, community features

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for mobile devices, with dedicated mobile interfaces for staff and citizens.

## 🔐 Security Features

- Row Level Security (RLS) policies
- Role-based access control
- Secure authentication with Supabase Auth
- Data encryption and secure API endpoints

## 🌍 Environmental Impact Tracking

- Waste diversion from landfills
- CO₂ reduction calculations
- Compost production metrics
- Sustainability reporting

## 📊 Key Metrics Tracked

- Staff attendance and performance
- Waste collection efficiency
- Composting process optimization
- Citizen satisfaction and engagement
- Environmental impact measurements

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set environment variables in the deployment platform
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**SANGBO BERDE** - Transforming waste management through technology and community engagement. 🌱