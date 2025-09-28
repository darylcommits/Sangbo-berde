import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  FireIcon,
  ShieldExclamationIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([])
  const [staff, setStaff] = useState([
    { id: 'staff-1', full_name: 'John Doe', role: 'collector', barangay: 'Barangay A' },
    { id: 'staff-2', full_name: 'Jane Smith', role: 'facility_staff', barangay: 'Barangay B' },
    { id: 'staff-3', full_name: 'Mike Johnson', role: 'supervisor', barangay: 'Barangay C' }
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [newAlert, setNewAlert] = useState({
    type: 'route_update',
    title: '',
    message: '',
    priority: 'medium',
    category: 'route',
    target_users: [],
    data: {}
  })

  // Initialize with demo data immediately
  useEffect(() => {
    if (alerts.length === 0) {
      setAlerts(generateDemoAlerts())
    }
    fetchAlerts()
    fetchStaff()
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user:profiles!user_id(full_name, role, barangay)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Notifications table error:', error)
        // Keep existing alerts if database fails
        return
      } else {
        console.log('Successfully fetched alerts from database:', data?.length || 0)
        if (data && data.length > 0) {
          setAlerts(data)
        }
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      // Keep existing alerts on error
    }
  }

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, barangay')
        .in('role', ['collector', 'facility_staff', 'supervisor'])

      if (error) {
        console.log('Staff fetch error:', error)
        // Keep existing staff if database fails
        return
      } else {
        if (data && data.length > 0) {
          setStaff(data)
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      // Keep existing staff on error
    }
  }

  const generateDemoAlerts = () => {
    return [
      {
        id: 'demo-1',
        type: 'route_update',
        title: 'Route Change Alert',
        message: 'Your collection route has been updated. Please check the new route details.',
        priority: 'high',
        category: 'route',
        is_read: false,
        created_at: new Date().toISOString(),
        user: { full_name: 'John Doe', role: 'collector', barangay: 'Barangay A' },
        data: {
          route_id: 'R001',
          new_route: 'Barangay A → Barangay B → Barangay C',
          estimated_time: '2 hours'
        }
      },
      {
        id: 'demo-2',
        type: 'facility_load',
        title: 'Facility Capacity Alert',
        message: 'Composting facility is at 85% capacity. Please coordinate with facility staff.',
        priority: 'urgent',
        category: 'facility',
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user: { full_name: 'Jane Smith', role: 'facility_staff', barangay: 'Barangay B' },
        data: {
          facility_id: 'F001',
          current_load: 85,
          max_capacity: 100,
          action_required: 'Coordinate with facility staff'
        }
      }
    ]
  }

  const createAlert = async (e) => {
    e.preventDefault()
    
    try {
      const alertData = {
        ...newAlert,
        created_at: new Date().toISOString(),
        is_read: false
      }

      // Send to all target users
      const alertPromises = newAlert.target_users.map(userId => 
        supabase.from('notifications').insert({
          user_id: userId,
          type: newAlert.type,
          title: newAlert.title,
          message: newAlert.message,
          priority: newAlert.priority,
          category: newAlert.category,
          data: newAlert.data,
          is_read: false
        })
      )

      const results = await Promise.all(alertPromises)
      const hasError = results.some(result => result.error)

      if (hasError) {
        console.log('Database insert failed, using local state update')
        // Fallback to local state update
        const newAlerts = newAlert.target_users.map(userId => {
          const user = staff.find(s => s.id === userId)
          return {
            id: `local-${Date.now()}-${userId}`,
            user_id: userId,
            type: newAlert.type,
            title: newAlert.title,
            message: newAlert.message,
            priority: newAlert.priority,
            category: newAlert.category,
            data: newAlert.data,
            is_read: false,
            created_at: new Date().toISOString(),
            user: user || { full_name: 'Unknown User', role: 'Unknown', barangay: 'Unknown' }
          }
        })
        setAlerts(prev => [...newAlerts, ...prev])
      } else {
        console.log('Alert created successfully')
        fetchAlerts() // Refresh the list
      }

      // Reset form
      setNewAlert({
        type: 'route_update',
        title: '',
        message: '',
        priority: 'medium',
        category: 'route',
        target_users: [],
        data: {}
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating alert:', error)
      alert('Failed to create alert. Please try again.')
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', alertId)

      if (error) {
        console.log('Database delete failed, using local state update')
        // Fallback to local state update
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      } else {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      // Fallback to local state update
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.category === filter
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>
          <p className="text-gray-600">Manage mobile response alerts for staff</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
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
        
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Alert</h3>
          <form onSubmit={createAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="task_assignment">Task Assignment</option>
                  <option value="missed_route_alert">Missed Route Alert</option>
                  <option value="overflow_bin_alert">Overflow Bin Alert</option>
                  <option value="facility_load_update">Facility Load Update</option>
                  <option value="facility_capacity_warning">Facility Capacity Warning</option>
                  <option value="task_completion_reminder">Task Completion Reminder</option>
                  <option value="route_update">Route Update</option>
                  <option value="environmental_complaint">Environmental Complaint</option>
                  <option value="weather_alert">Weather Alert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newAlert.priority}
                  onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newAlert.title}
                onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter alert title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter alert message"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Staff</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {staff.map(member => (
                  <label key={member.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newAlert.target_users.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAlert({
                            ...newAlert,
                            target_users: [...newAlert.target_users, member.id]
                          })
                        } else {
                          setNewAlert({
                            ...newAlert,
                            target_users: newAlert.target_users.filter(id => id !== member.id)
                          })
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{member.full_name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Create Alert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alerts ({filteredAlerts.length})</h3>
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type, alert.priority)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>To: {alert.user?.full_name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span className={alert.is_read ? 'text-green-600' : 'text-red-600'}>
                        {alert.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertManagement
