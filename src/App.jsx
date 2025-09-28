import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './components/dashboard/Dashboard'
import MobileInterface from './components/mobile/MobileInterface'
import CitizenPortal from './components/citizen/CitizenPortal'
import SetupRequired from './components/common/SetupRequired'
import LandingPage from './components/landing/LandingPage'
import AuthDebug from './components/debug/AuthDebug'

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true)
  const { user } = useAuth()
  
  // If user is already authenticated, redirect to app
  if (user) {
    return <Navigate to="/app" replace />
  }
  
  return isLogin ? (
    <LoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <SignupForm onToggleMode={() => setIsLogin(true)} />
  )
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

const RoleBasedRoute = () => {
  const { user, profile, setupRequired } = useAuth()

  console.log('RoleBasedRoute - user:', user?.id, 'profile:', profile, 'setupRequired:', setupRequired)

  if (setupRequired) {
    return <SetupRequired />
  }

  // If user is authenticated but profile is still loading, wait a bit
  if (user && !profile) {
    console.log('RoleBasedRoute - user authenticated but profile loading, waiting...')
    // Return a simple loading state or wait for profile
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('RoleBasedRoute - no user, redirecting to landing')
    return <Navigate to="/" replace />
  }

  if (!profile) {
    console.log('RoleBasedRoute - no profile, redirecting to landing')
    return <Navigate to="/" replace />
  }

  console.log('RoleBasedRoute - routing user with role:', profile.role)

  // Route users based on their role
  switch (profile.role) {
    case 'admin':
    case 'supervisor':
      console.log('RoleBasedRoute - redirecting to dashboard')
      return <Navigate to="/dashboard" replace />
    case 'collector':
    case 'facility_staff':
      console.log('RoleBasedRoute - redirecting to mobile')
      return <Navigate to="/mobile" replace />
    case 'citizen':
      console.log('RoleBasedRoute - redirecting to citizen')
      return <Navigate to="/citizen" replace />
    default:
      console.log('RoleBasedRoute - default redirect to dashboard')
      return <Navigate to="/dashboard" replace />
  }
}

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
        <span className="text-2xl">🚫</span>
      </div>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        Access Denied
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        You don't have permission to access this area.
      </p>
    </div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AuthDebug />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthWrapper />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/app" element={<RoleBasedRoute />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mobile"
              element={
                <ProtectedRoute allowedRoles={['collector', 'facility_staff', 'supervisor']}>
                  <MobileInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenPortal />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App