import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AuthDebug = () => {
  const { user, profile, loading, setupRequired } = useAuth()

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...')
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('Database connection failed:', error)
        alert(`Database error: ${error.message}`)
      } else {
        console.log('Database connection successful:', data)
        alert('Database connection successful!')
      }
    } catch (error) {
      console.error('Database test failed:', error)
      alert(`Database test failed: ${error.message}`)
    }
  }

  const testAuth = async () => {
    try {
      console.log('Testing auth...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth test failed:', error)
        alert(`Auth error: ${error.message}`)
      } else {
        console.log('Auth test successful:', session)
        alert(`Auth test successful! User: ${session?.user?.email || 'No user'}`)
      }
    } catch (error) {
      console.error('Auth test failed:', error)
      alert(`Auth test failed: ${error.message}`)
    }
  }


}

export default AuthDebug
