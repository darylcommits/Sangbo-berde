import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const NotificationService = ({ userId, onNotification }) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          if (onNotification) {
            onNotification(payload.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onNotification])

  return null
}

export default NotificationService
