import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If table doesn't exist, show setup message
        if (error.code === '42P01') {
          console.error('Database tables not created yet. Please run the database schema in Supabase.')
          setSetupRequired(true)
        }
        // Create a fallback profile for demo purposes
        setProfile({
          id: userId,
          email: user?.email || 'demo@example.com',
          full_name: 'Demo User',
          role: 'admin',
          phone: '123-456-7890',
          barangay: 'Demo Barangay'
        })
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Create a fallback profile for demo purposes
      setProfile({
        id: userId,
        email: user?.email || 'demo@example.com',
        full_name: 'Demo User',
        role: 'admin',
        phone: '123-456-7890',
        barangay: 'Demo Barangay'
      })
    }
  }

  const signUp = async (email, password, fullName, role, phone, barangay) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            phone,
            barangay,
          })

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Attempting to sign in user:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
      
      console.log('Sign in successful:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh profile
      await fetchProfile(user.id)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    setupRequired,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
