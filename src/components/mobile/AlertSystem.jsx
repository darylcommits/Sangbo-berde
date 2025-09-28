import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  FireIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const AlertSystem = () => {
  const { profile } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [filter, setFilter] = useState('all') // all, route, facility, environmental, urgent

  useEffect(() => {
    fetchAlerts()
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('New alert received:', payload.new)
          setAlerts(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.log('Notifications table error:', error)
        // Fallback to demo alerts
        const demoAlerts = generateDemoAlerts()
        setAlerts(demoAlerts)
        setUnreadCount(demoAlerts.filter(alert => !alert.is_read).length)
      } else {
        console.log('Successfully fetched alerts from database:', data?.length || 0)
        setAlerts(data || [])
        setUnreadCount((data || []).filter(alert => !alert.is_read).length)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      // Final fallback to demo alerts
      const demoAlerts = generateDemoAlerts()
      setAlerts(demoAlerts)
      setUnreadCount(demoAlerts.filter(alert => !alert.is_read).length)
    } finally {
      setLoading(false)
    }
  }

  const generateDemoAlerts = () => {
    return [
      {
        id: 'demo-1',
        type: 'task_assignment',
        title: 'New Collection Task',
        message: 'Barangay A – 7:00 AM collection scheduled. Please start your route.',
        priority: 'high',
        category: 'task',
        is_read: false,
        created_at: new Date().toISOString(),
        data: {
          task_id: 'T001',
          location: 'Barangay A',
          scheduled_time: '7:00 AM',
          estimated_duration: '2 hours',
          route_coordinates: [
            { lat: 17.87, lng: 120.46, name: 'Start Point' },
            { lat: 17.88, lng: 120.47, name: 'Collection Point 1' },
            { lat: 17.89, lng: 120.48, name: 'Collection Point 2' }
          ],
          bins_expected: 15,
          special_instructions: 'Use covered truck due to weather'
        }
      },
      {
        id: 'demo-2',
        type: 'missed_route_alert',
        title: 'Urgent: Missed Route Alert',
        message: 'Barangay B collection missed. Please return immediately to complete route.',
        priority: 'urgent',
        category: 'task',
        is_read: false,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        data: {
          route_id: 'R002',
          location: 'Barangay B',
          missed_time: '6:30 AM',
          current_time: '7:45 AM',
          delay_minutes: 75,
          bins_remaining: 8,
          action_required: 'Return to complete collection immediately'
        }
      },
      {
        id: 'demo-3',
        type: 'overflow_bin_alert',
        title: 'Overflow Bin Alert',
        message: 'Bin overflow detected at Barangay C. Additional collection required.',
        priority: 'urgent',
        category: 'task',
        is_read: false,
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        data: {
          bin_id: 'B003',
          location: 'Barangay C - Main Street',
          overflow_percentage: 120,
          capacity: '500L',
          current_load: '600L',
          coordinates: { lat: 17.90, lng: 120.49 },
          action_required: 'Send additional truck for overflow collection'
        }
      },
      {
        id: 'demo-4',
        type: 'facility_load_update',
        title: 'Incoming Waste Load',
        message: 'Incoming 500kg biodegradable waste from Barangay A. Prepare for processing.',
        priority: 'medium',
        category: 'facility',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        data: {
          facility_id: 'F001',
          incoming_weight: '500kg',
          waste_type: 'biodegradable',
          source: 'Barangay A',
          estimated_arrival: '15 minutes',
          processing_requirements: 'Sort and prepare for composting',
          current_facility_load: 75
        }
      },
      {
        id: 'demo-5',
        type: 'facility_capacity_warning',
        title: 'Facility Capacity Alert',
        message: 'Composting facility is at 85% capacity. Please coordinate with facility staff.',
        priority: 'urgent',
        category: 'facility',
        is_read: true,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        data: {
          facility_id: 'F001',
          current_load: 85,
          max_capacity: 100,
          action_required: 'Coordinate with facility staff',
          alternative_facilities: [
            { id: 'F002', name: 'Secondary Facility', capacity: 60 }
          ]
        }
      },
      {
        id: 'demo-6',
        type: 'task_completion_reminder',
        title: 'Task Completion Reminder',
        message: 'Your Barangay A collection task is due in 30 minutes. Please update status.',
        priority: 'medium',
        category: 'task',
        is_read: true,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        data: {
          task_id: 'T001',
          location: 'Barangay A',
          due_time: '8:00 AM',
          time_remaining: '30 minutes',
          completion_status: 'in_progress',
          bins_collected: 8,
          bins_remaining: 7
        }
      }
    ]
  }

  const markAsRead = async (alertId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) {
        console.log('Database update failed, using local state update')
        // Fallback to local state update
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
      // Fallback to local state update
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)

      if (error) {
        console.log('Database update failed, using local state update')
        // Fallback to local state update
        setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })))
        setUnreadCount(0)
      } else {
        setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
      // Fallback to local state update
      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })))
      setUnreadCount(0)
    }
  }

  const getAlertIcon = (type, priority) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-600' :
      priority === 'high' ? 'text-orange-600' :
      priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
    }`

    switch (type) {
      case 'task_assignment':
        return <ClipboardDocumentListIcon className={iconClass} />
      case 'missed_route_alert':
        return <ExclamationTriangleIcon className={iconClass} />
      case 'overflow_bin_alert':
        return <ExclamationTriangleIcon className={iconClass} />
      case 'facility_load_update':
        return <TruckIcon className={iconClass} />
      case 'facility_capacity_warning':
        return <ExclamationTriangleIcon className={iconClass} />
      case 'task_completion_reminder':
        return <ClockIcon className={iconClass} />
      case 'route_update':
        return <TruckIcon className={iconClass} />
      case 'facility_load':
        return <ExclamationTriangleIcon className={iconClass} />
      case 'environmental_complaint':
        return <FireIcon className={iconClass} />
      case 'weather_alert':
        return <ShieldExclamationIcon className={iconClass} />
      default:
        return <BellIcon className={iconClass} />
    }
  }

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent'
      case 'high':
        return 'High'
      case 'medium':
        return 'Medium'
      default:
        return 'Low'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.is_read
    return alert.category === filter
  })

  const displayAlerts = showAllAlerts ? filteredAlerts : filteredAlerts.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Alert Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellIcon className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{unreadCount}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mobile Alerts</h3>
            <p className="text-sm text-gray-500">
              {unreadCount} unread • {alerts.length} total
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAllAlerts(!showAllAlerts)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAllAlerts ? 'Show Less' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'task', label: 'Tasks' },
          { key: 'route', label: 'Route' },
          { key: 'facility', label: 'Facility' },
          { key: 'environmental', label: 'Environmental' },
          { key: 'urgent', label: 'Urgent' }
        ].map(filterOption => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              alert.is_read ? 'opacity-60' : 'opacity-100'
            } ${getAlertColor(alert.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type, alert.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {alert.title}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      alert.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {getPriorityLabel(alert.priority)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                    {!alert.is_read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-700">
                  {alert.message}
                </p>
                
                {/* Alert Data */}
                {alert.data && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                    <div className="text-xs text-gray-600">
                      {alert.type === 'task_assignment' && (
                        <div className="space-y-1">
                          <div><strong>Task ID:</strong> {alert.data.task_id}</div>
                          <div><strong>Location:</strong> {alert.data.location}</div>
                          <div><strong>Scheduled Time:</strong> {alert.data.scheduled_time}</div>
                          <div><strong>Duration:</strong> {alert.data.estimated_duration}</div>
                          <div><strong>Bins Expected:</strong> {alert.data.bins_expected}</div>
                          {alert.data.special_instructions && (
                            <div><strong>Instructions:</strong> {alert.data.special_instructions}</div>
                          )}
                        </div>
                      )}
                      {alert.type === 'missed_route_alert' && (
                        <div className="space-y-1">
                          <div><strong>Route ID:</strong> {alert.data.route_id}</div>
                          <div><strong>Location:</strong> {alert.data.location}</div>
                          <div><strong>Missed Time:</strong> {alert.data.missed_time}</div>
                          <div><strong>Delay:</strong> {alert.data.delay_minutes} minutes</div>
                          <div><strong>Bins Remaining:</strong> {alert.data.bins_remaining}</div>
                          <div><strong>Action:</strong> {alert.data.action_required}</div>
                        </div>
                      )}
                      {alert.type === 'overflow_bin_alert' && (
                        <div className="space-y-1">
                          <div><strong>Bin ID:</strong> {alert.data.bin_id}</div>
                          <div><strong>Location:</strong> {alert.data.location}</div>
                          <div><strong>Overflow:</strong> {alert.data.overflow_percentage}%</div>
                          <div><strong>Capacity:</strong> {alert.data.capacity}</div>
                          <div><strong>Current Load:</strong> {alert.data.current_load}</div>
                          <div><strong>Action:</strong> {alert.data.action_required}</div>
                        </div>
                      )}
                      {alert.type === 'facility_load_update' && (
                        <div className="space-y-1">
                          <div><strong>Facility ID:</strong> {alert.data.facility_id}</div>
                          <div><strong>Incoming Weight:</strong> {alert.data.incoming_weight}</div>
                          <div><strong>Waste Type:</strong> {alert.data.waste_type}</div>
                          <div><strong>Source:</strong> {alert.data.source}</div>
                          <div><strong>Arrival:</strong> {alert.data.estimated_arrival}</div>
                          <div><strong>Requirements:</strong> {alert.data.processing_requirements}</div>
                        </div>
                      )}
                      {alert.type === 'facility_capacity_warning' && (
                        <div className="space-y-1">
                          <div><strong>Facility ID:</strong> {alert.data.facility_id}</div>
                          <div><strong>Current Load:</strong> {alert.data.current_load}%</div>
                          <div><strong>Max Capacity:</strong> {alert.data.max_capacity}%</div>
                          <div><strong>Action Required:</strong> {alert.data.action_required}</div>
                        </div>
                      )}
                      {alert.type === 'task_completion_reminder' && (
                        <div className="space-y-1">
                          <div><strong>Task ID:</strong> {alert.data.task_id}</div>
                          <div><strong>Location:</strong> {alert.data.location}</div>
                          <div><strong>Due Time:</strong> {alert.data.due_time}</div>
                          <div><strong>Time Remaining:</strong> {alert.data.time_remaining}</div>
                          <div><strong>Bins Collected:</strong> {alert.data.bins_collected}</div>
                          <div><strong>Bins Remaining:</strong> {alert.data.bins_remaining}</div>
                        </div>
                      )}
                      {alert.type === 'route_update' && (
                        <div className="space-y-1">
                          <div><strong>Route ID:</strong> {alert.data.route_id}</div>
                          <div><strong>New Route:</strong> {alert.data.new_route}</div>
                          <div><strong>Estimated Time:</strong> {alert.data.estimated_time}</div>
                        </div>
                      )}
                      {alert.type === 'facility_load' && (
                        <div className="space-y-1">
                          <div><strong>Facility ID:</strong> {alert.data.facility_id}</div>
                          <div><strong>Current Load:</strong> {alert.data.current_load}%</div>
                          <div><strong>Max Capacity:</strong> {alert.data.max_capacity}%</div>
                          <div><strong>Action Required:</strong> {alert.data.action_required}</div>
                        </div>
                      )}
                      {alert.type === 'environmental_complaint' && (
                        <div className="space-y-1">
                          <div><strong>Complaint ID:</strong> {alert.data.complaint_id}</div>
                          <div><strong>Location:</strong> {alert.data.location}</div>
                          <div><strong>Reporter:</strong> {alert.data.reporter}</div>
                          <div><strong>Urgency:</strong> {alert.data.urgency}</div>
                        </div>
                      )}
                      {alert.type === 'weather_alert' && (
                        <div className="space-y-1">
                          <div><strong>Condition:</strong> {alert.data.weather_condition}</div>
                          <div><strong>Impact:</strong> {alert.data.impact}</div>
                          <div><strong>Recommendation:</strong> {alert.data.recommendation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Alerts Message */}
      {displayAlerts.length === 0 && (
        <div className="text-center py-8">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'all' ? 'No alerts available' : `No ${filter} alerts found`}
          </p>
        </div>
      )}

      {/* Load More Button */}
      {!showAllAlerts && filteredAlerts.length > 5 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllAlerts(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Load More ({filteredAlerts.length - 5} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

export default AlertSystem
