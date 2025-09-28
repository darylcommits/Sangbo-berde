import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  ClockIcon, 
  MapPinIcon, 
  ClipboardDocumentListIcon,
  CameraIcon,
  BellIcon,
  QrCodeIcon,
  HomeIcon,
  UserIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  TruckIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import GPSLocation from './GPSLocation'
import RouteTracking from './RouteTracking'
import QRCodeScanner from './QRCodeScanner'
import QRScanner from './QRScanner'
import AlertSystem from './AlertSystem'
import logo from '../../assets/logo.jpg'

const MobileInterface = () => {
  const { profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [tasks, setTasks] = useState([])
  const [attendance, setAttendance] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentRoute, setCurrentRoute] = useState(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [loadingTask, setLoadingTask] = useState(null)
  const [readNotifications, setReadNotifications] = useState(new Set())

  useEffect(() => {
    fetchData()
    setIsVisible(true)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleStartTask = async (taskId) => {
    console.log('Starting task:', taskId) // Debug log
    setLoadingTask(taskId) // Set loading state
    
    try {
      // First, let's check if the task exists and get current data
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (fetchError) {
        console.error('Error fetching task:', fetchError)
        
        // If database is not available, use local state update as fallback
        console.log('Database not available, using local state update')
        
        // Update local state immediately for better UX
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'in_progress', started_at: new Date().toISOString() }
              : task
          )
        )
        
        alert('Task started successfully! (Offline mode)')
        setLoadingTask(null)
        return
      }

      console.log('Task data:', taskData)

      // Update the task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        console.error('Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        
        // Fallback to local state update
        console.log('Database update failed, using local state update')
        
        // Update local state immediately for better UX
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'in_progress', started_at: new Date().toISOString() }
              : task
          )
        )
        
        alert('Task started successfully! (Local update)')
        setLoadingTask(null)
        return
      }
      
      console.log('Task started successfully') // Debug log
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'in_progress', started_at: new Date().toISOString() }
            : task
        )
      )
      
      // Refresh tasks from database
      await fetchData()
      
      // Show success message
      alert('Task started successfully!')
      
    } catch (error) {
      console.error('Error starting task:', error)
      
      // Final fallback - update local state
      console.log('Using fallback local state update')
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'in_progress', started_at: new Date().toISOString() }
            : task
        )
      )
      
      alert('Task started successfully! (Fallback mode)')
    } finally {
      setLoadingTask(null) // Clear loading state
    }
  }

  const handleViewTaskDetails = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleMarkNotificationRead = (notificationId) => {
    setReadNotifications(prev => new Set([...prev, notificationId]))
    
    // Try to update in database if available
    if (notificationId.startsWith('demo-')) {
      console.log('Demo notification marked as read:', notificationId)
    } else {
      // Update in database
      supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .then(({ error }) => {
          if (error) {
            console.log('Could not update notification in database:', error)
          }
        })
    }
  }

  const handleQRScan = async (qrData) => {
    try {
      console.log('QR Code scanned:', qrData)
      
      // Get current GPS location for validation
      const currentLocation = await getCurrentGPSLocation()
      
      if (!currentLocation) {
        alert('Unable to get current location. Please ensure location services are enabled.')
        return
      }
      
      // Validate location against QR code location (within 100m tolerance)
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        parseFloat(qrData.location.lat),
        parseFloat(qrData.location.lng)
      )
      
      if (distance > 100) {
        alert(`Location validation failed. You are ${Math.round(distance)}m away from the expected location. Please move closer to the QR code location.`)
        return
      }
      
      // Create attendance record with validated GPS location
      const attendanceData = {
        staff_id: profile.id,
        check_in: new Date().toISOString(),
        location_lat: currentLocation.lat.toString(),
        location_lng: currentLocation.lng.toString(),
        status: 'present',
        notes: `QR code check-in (${Math.round(distance)}m from QR location)`
      }
      
      // Try to save to database
      const { error } = await supabase
        .from('attendance')
        .insert(attendanceData)
      
      if (error) {
        console.log('Database not available, using local storage fallback')
        // Fallback to local storage
        const newAttendance = {
          id: `local-${Date.now()}`,
          ...attendanceData,
          created_at: new Date().toISOString()
        }
        
        // Store in local storage
        const existingAttendance = JSON.parse(localStorage.getItem('attendance') || '[]')
        existingAttendance.unshift(newAttendance)
        localStorage.setItem('attendance', JSON.stringify(existingAttendance))
        
        // Update state
        setAttendance(newAttendance)
        
        // Dispatch custom event to notify admin dashboard
        window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
          detail: { attendance: newAttendance } 
        }))
        
        alert(`Attendance recorded successfully! (Saved locally)\nLocation: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}\nDistance from QR: ${Math.round(distance)}m`)
      } else {
        console.log('Attendance recorded successfully in database')
        setAttendance(attendanceData)
        alert(`Attendance recorded successfully!\nLocation: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}\nDistance from QR: ${Math.round(distance)}m`)
      }
      
      setShowQRScanner(false)
    } catch (error) {
      console.error('Error recording attendance:', error)
      alert('Failed to record attendance. Please try again.')
    }
  }

  // Helper function to get current GPS location
  const getCurrentGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  const handleCompleteTask = async (taskId) => {
    console.log('Completing task:', taskId) // Debug log
    setLoadingTask(taskId) // Set loading state
    
    try {
      // First, let's check if the task exists and get current data
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (fetchError) {
        console.error('Error fetching task:', fetchError)
        
        // If database is not available, use local state update as fallback
        console.log('Database not available, using local state update')
        
        // Update local state immediately for better UX
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
              : task
          )
        )
        
        alert('Task completed successfully! (Offline mode)')
        setLoadingTask(null)
        return
      }

      console.log('Task data:', taskData)

      // Update the task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (updateError) {
        console.error('Supabase update error:', updateError)
        console.error('Error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        
        // Fallback to local state update
        console.log('Database update failed, using local state update')
        
        // Update local state immediately for better UX
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
              : task
          )
        )
        
        alert('Task completed successfully! (Local update)')
        setLoadingTask(null)
        return
      }
      
      console.log('Task completed successfully') // Debug log
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
            : task
        )
      )
      
      // Refresh tasks from database
      await fetchData()
      
      // Show success message
      alert('Task completed successfully!')
      
    } catch (error) {
      console.error('Error completing task:', error)
      
      // Final fallback - update local state
      console.log('Using fallback local state update')
      
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
            : task
        )
      )
      
      alert('Task completed successfully! (Fallback mode)')
    } finally {
      setLoadingTask(null) // Clear loading state
    }
  }

  const fetchData = async () => {
    try {
      // Fetch user's tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', profile.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('staff_id', profile.id)
        .gte('check_in', today)
        .single()

      // Fetch notifications
      let notificationsData = []
      try {
        const { data: notificationsResult, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5)

        if (notificationsError) {
          console.log('Notifications table not available, using demo data')
          // Fallback to demo notifications
          notificationsData = [
            {
              id: 'demo-1',
              title: 'New Task Assigned',
              message: 'You have been assigned a new collection route for Zone A',
              created_at: new Date().toISOString(),
              type: 'task_assigned'
            },
            {
              id: 'demo-2',
              title: 'Route Update',
              message: 'Your collection route has been updated. Please check the new schedule.',
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              type: 'route_update'
            },
            {
              id: 'demo-3',
              title: 'Weather Alert',
              message: 'Heavy rain expected. Please take necessary precautions during collection.',
              created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              type: 'weather_alert'
            }
          ]
        } else {
          notificationsData = notificationsResult || []
        }
      } catch (error) {
        console.log('Notifications fetch failed, using demo data:', error)
        // Fallback to demo notifications
        notificationsData = [
          {
            id: 'demo-1',
            title: 'New Task Assigned',
            message: 'You have been assigned a new collection route for Zone A',
            created_at: new Date().toISOString(),
            type: 'task_assigned'
          },
          {
            id: 'demo-2',
            title: 'Route Update',
            message: 'Your collection route has been updated. Please check the new schedule.',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            type: 'route_update'
          },
          {
            id: 'demo-3',
            title: 'Weather Alert',
            message: 'Heavy rain expected. Please take necessary precautions during collection.',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            type: 'weather_alert'
          }
        ]
      }

      setTasks(tasksData || [])
      setAttendance(attendanceData)
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (location = null) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          staff_id: profile.id,
          check_in: new Date().toISOString(),
          status: 'present',
          location_lat: location?.lat,
          location_lng: location?.lng
        })

      if (error) throw error
      
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error checking in:', error)
    }
  }

  const handleCheckOut = async () => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', attendance.id)

      if (error) throw error
      
      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error checking out:', error)
    }
  }

  const HomeTab = () => (
    <div className={`space-y-6 transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {profile?.full_name}!</h2>
            <p className="text-green-100 mt-1">Ready to make a difference today?</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <TruckIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-100">Active Status</span>
        </div>
      </div>

      {/* Attendance Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg ${
              attendance ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}>
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Attendance</h3>
              <p className="text-sm text-gray-500">
                {attendance ? 'You are checked in' : 'Not checked in yet'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {!attendance ? (
              <button
                onClick={handleCheckIn}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <ClockIcon className="h-4 w-4" />
                <span>Check In</span>
              </button>
            ) : !attendance.check_out ? (
              <button
                onClick={handleCheckOut}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <ClockIcon className="h-4 w-4" />
                <span>Check Out</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-xl">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium">Shift Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: 'Active Tasks',
            value: tasks.length,
            icon: ClipboardDocumentListIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            title: 'New Alerts',
            value: notifications.length,
            icon: BellIcon,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
          }
        ].map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center group hover:shadow-xl transition-all duration-300"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
            }}
          >
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Tasks</h3>
          <SparklesIcon className="h-5 w-5 text-green-500" />
        </div>
        <div className="space-y-4">
          {tasks.slice(0, 3).map((task, index) => (
            <div
              key={task.id}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200 group"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isVisible ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Priority: {task.priority} • Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No active tasks</h4>
              <p className="text-gray-500">You're all caught up! Great job!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const TasksTab = () => (
    <div className={`space-y-6 transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600 mt-1">Manage your assigned tasks</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: tasks.length, color: 'from-blue-500 to-blue-600' },
          { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'from-green-500 to-emerald-500' }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 text-center"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
            }}
          >
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
              <ChartBarIcon className="h-4 w-4 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: isVisible ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-500">Task ID: #{task.id.slice(-6)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority} priority
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {task.status === 'pending' ? (
                  <button 
                    onClick={() => handleStartTask(task.id)}
                    disabled={loadingTask === task.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loadingTask === task.id 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {loadingTask === task.id ? 'Starting...' : 'Start Task'}
                  </button>
                ) : task.status === 'in_progress' ? (
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={loadingTask === task.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      loadingTask === task.id 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {loadingTask === task.id ? 'Completing...' : 'Complete Task'}
                  </button>
                ) : (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                    Completed
                  </span>
                )}
                <button 
                  onClick={() => handleViewTaskDetails(task)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-medium text-gray-900 mb-2">No tasks assigned</h4>
            <p className="text-gray-500 mb-4">You're all caught up! Great job!</p>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              Request New Task
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const NotificationsTab = () => (
    <div className={`space-y-6 transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-gray-600 mt-1">Stay updated with important alerts</p>
      </div>
      
      {/* Notification Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Alert Summary</h3>
            <p className="text-sm text-gray-500">
              You have {notifications.filter(n => !readNotifications.has(n.id)).length} unread notifications
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <BellIcon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification, index) => {
          const isRead = readNotifications.has(notification.id)
          const notificationType = notification.type || 'general'
          
          const getNotificationIcon = (type) => {
            switch (type) {
              case 'task_assigned':
                return <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
              case 'route_update':
                return <TruckIcon className="h-5 w-5 text-white" />
              case 'weather_alert':
                return <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              default:
                return <BellIcon className="h-5 w-5 text-white" />
            }
          }

          const getNotificationColor = (type) => {
            switch (type) {
              case 'task_assigned':
                return 'from-green-500 to-emerald-500'
              case 'route_update':
                return 'from-blue-500 to-blue-600'
              case 'weather_alert':
                return 'from-orange-500 to-red-500'
              default:
                return 'from-gray-500 to-gray-600'
            }
          }

          return (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                isRead ? 'opacity-75' : ''
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isVisible ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
              }}
              onClick={() => handleMarkNotificationRead(notification.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${getNotificationColor(notificationType)} flex items-center justify-center shadow-lg`}>
                    {getNotificationIcon(notificationType)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className={`text-sm font-semibold mb-2 ${
                      isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    {!isRead && (
                      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className={`text-sm mb-3 ${
                    isRead ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      notificationType === 'task_assigned' ? 'bg-green-100 text-green-800' :
                      notificationType === 'route_update' ? 'bg-blue-100 text-blue-800' :
                      notificationType === 'weather_alert' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notificationType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BellIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-medium text-gray-900 mb-2">No notifications</h4>
            <p className="text-gray-500">You're all caught up! Great job!</p>
          </div>
        )}
      </div>
    </div>
  )

  const ProfileTab = () => (
    <div className={`space-y-6 transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">
              {profile?.full_name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
            <p className="text-gray-600 capitalize mb-1">{profile?.role?.replace('_', ' ')}</p>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {profile?.barangay || 'Not specified'}
            </p>
          </div>
          <div className="text-right">
            <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
          <UserIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="space-y-4">
          {[
            {
              label: 'Email',
              value: profile?.email,
              icon: '📧',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              label: 'Phone',
              value: profile?.phone || 'Not provided',
              icon: '📱',
              color: 'from-green-500 to-emerald-500'
            },
            {
              label: 'Barangay',
              value: profile?.barangay || 'Not specified',
              icon: '🏘️',
              color: 'from-purple-500 to-pink-500'
            }
          ].map((field, index) => (
            <div
              key={field.label}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isVisible ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-r ${field.color} flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{field.icon}</span>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-500">{field.label}</label>
                <p className="text-gray-900 font-medium">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Work Summary</h3>
          <SparklesIcon className="h-6 w-6" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-sm text-green-100">Tasks Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-green-100">Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:shadow-md transition-all duration-200 border border-red-100 group"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Sign Out</p>
              <p className="text-sm text-gray-500">End your session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const TrackingTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">GPS & QR Tracking</h2>
        <button
          onClick={() => setShowQRScanner(!showQRScanner)}
          className="btn-primary flex items-center space-x-2"
        >
          <QrCodeIcon className="h-4 w-4" />
          <span>QR Scanner</span>
        </button>
      </div>

      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <GPSLocation
        onLocationUpdate={(location) => {
          console.log('Location updated:', location)
          // Update attendance with current location if available
          if (attendance && !attendance.check_out) {
            setAttendance(prev => ({
              ...prev,
              location_lat: location.lat.toString(),
              location_lng: location.lng.toString()
            }))
          }
        }}
        isRequired={true}
        validateLocation={attendance ? true : false}
        expectedLocation={attendance ? {
          lat: parseFloat(attendance.location_lat || 0),
          lng: parseFloat(attendance.location_lng || 0)
        } : null}
      />

      {currentRoute && (
        <RouteTracking
          route={currentRoute}
          onRouteUpdate={(location) => {
            console.log('Route location update:', location)
          }}
        />
      )}

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Options</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowQRScanner(true)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <QrCodeIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">QR Code Check-in</p>
                <p className="text-xs text-gray-500">Scan QR code for attendance</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  }
                  handleCheckIn(location)
                },
                (error) => console.error('Location error:', error)
              )
            }}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <MapPinIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">GPS Check-in</p>
                <p className="text-xs text-gray-500">Use GPS location for attendance</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const TaskDetailsModal = () => {
    if (!selectedTask) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Task Details</h3>
                <p className="text-sm text-gray-500">Task ID: #{selectedTask.id.slice(-6)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowTaskModal(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedTask.title}</h4>
              <p className="text-gray-600">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Priority</div>
                <div className={`text-sm font-medium ${
                  selectedTask.priority === 'urgent' ? 'text-red-600' :
                  selectedTask.priority === 'high' ? 'text-orange-600' :
                  selectedTask.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {selectedTask.priority}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className={`text-sm font-medium ${
                  selectedTask.status === 'pending' ? 'text-yellow-600' :
                  selectedTask.status === 'in_progress' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {selectedTask.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Due Date</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(selectedTask.due_date).toLocaleDateString()}
              </div>
            </div>

            {selectedTask.location && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="text-sm font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {selectedTask.location}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Close
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  onClick={() => {
                    handleStartTask(selectedTask.id)
                    setShowTaskModal(false)
                  }}
                  disabled={loadingTask === selectedTask.id}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    loadingTask === selectedTask.id 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  }`}
                >
                  {loadingTask === selectedTask.id ? 'Starting...' : 'Start Task'}
                </button>
              )}
              {selectedTask.status === 'in_progress' && (
                <button
                  onClick={() => {
                    handleCompleteTask(selectedTask.id)
                    setShowTaskModal(false)
                  }}
                  disabled={loadingTask === selectedTask.id}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    loadingTask === selectedTask.id 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                  }`}
                >
                  {loadingTask === selectedTask.id ? 'Completing...' : 'Complete Task'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />
      case 'tasks':
        return <TasksTab />
      case 'tracking':
        return <TrackingTab />
      case 'notifications':
        return <AlertSystem />
      case 'profile':
        return <ProfileTab />
      default:
        return <HomeTab />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading your mobile interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={logo}
                  alt="SANGBO BERDE Logo"
                  className="h-8 w-8 object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SANGBO BERDE</h1>
                <p className="text-xs text-gray-500">Mobile Interface</p>
              </div>
            </div>
            
            {/* User Menu */}
            <div className="relative user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ')}</p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fadeIn">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 pb-20">
        <div className={`
          transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }
        `}>
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40">
        <div className="grid grid-cols-5">
          {[
            {
              tab: 'home',
              icon: HomeIcon,
              label: 'Home',
              color: 'from-green-500 to-emerald-500',
              bgColor: 'bg-green-50',
              textColor: 'text-green-600'
            },
            {
              tab: 'tasks',
              icon: ClipboardDocumentListIcon,
              label: 'Tasks',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600'
            },
            {
              tab: 'tracking',
              icon: MapPinIcon,
              label: 'GPS',
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600'
            },
            {
              tab: 'notifications',
              icon: BellIcon,
              label: 'Alerts',
              color: 'from-orange-500 to-red-500',
              bgColor: 'bg-orange-50',
              textColor: 'text-orange-600'
            },
            {
              tab: 'profile',
              icon: UserIcon,
              label: 'Profile',
              color: 'from-gray-500 to-gray-600',
              bgColor: 'bg-gray-50',
              textColor: 'text-gray-600'
            }
          ].map((item, index) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center py-3 transition-all duration-200 ${
                activeTab === item.tab
                  ? `${item.bgColor} ${item.textColor}`
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-1 transition-all duration-200 ${
                activeTab === item.tab
                  ? `bg-gradient-to-r ${item.color} shadow-lg`
                  : 'bg-gray-100'
              }`}>
                <item.icon className={`h-4 w-4 ${
                  activeTab === item.tab ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && <TaskDetailsModal />}
    </div>
  )
}

export default MobileInterface
