import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  UsersIcon, 
  ClipboardDocumentListIcon, 
  TruckIcon, 
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Modal from '../common/Modal'

const Overview = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeTasks: 0,
    collectionsToday: 0,
    compostProduced: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState(null)

  useEffect(() => {
    fetchOverviewData()
    setIsVisible(true)
  }, [])

  const fetchOverviewData = async () => {
    try {
      // Fetch staff count
      const { count: staffCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['collector', 'facility_staff', 'supervisor'])

      // Fetch active tasks
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress'])

      // Fetch today's collections
      const today = new Date().toISOString().split('T')[0]
      const { count: collectionsCount } = await supabase
        .from('collection_logs')
        .select('*', { count: 'exact', head: true })
        .gte('collection_date', today)

      // Fetch recent compost production
      const { data: compostData } = await supabase
        .from('compost_operations')
        .select('output_weight_kg')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('output_weight_kg', 'is', null)

      const totalCompost = compostData?.reduce((sum, item) => sum + (item.output_weight_kg || 0), 0) || 0

      setStats({
        totalStaff: staffCount || 0,
        activeTasks: tasksCount || 0,
        collectionsToday: collectionsCount || 0,
        compostProduced: totalCompost
      })

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles!inner(full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentActivity(activity || [])
    } catch (error) {
      console.error('Error fetching overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Staff',
      value: stats.totalStaff,
      icon: UsersIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Tasks',
      value: stats.activeTasks,
      icon: ClipboardDocumentListIcon,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Collections Today',
      value: stats.collectionsToday,
      icon: TruckIcon,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+18%',
      changeType: 'positive'
    },
    {
      name: 'Compost Produced (kg)',
      value: Math.round(stats.compostProduced),
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+25%',
      changeType: 'positive'
    }
  ]

  const handleQuickAction = (action) => {
    setModalContent(action)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading overview data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`}>
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to SANGBO BERDE
        </h2>
        <p className="text-gray-600 text-lg">
          Monitor your composting facility operations in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div 
            key={card.name} 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 border border-gray-100"
            style={{
              animationDelay: `${index * 150}ms`,
              animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{card.change}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full ${card.bgColor} mr-2`}></div>
                <span className="text-xs text-gray-500">vs last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <SparklesIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {activity.profiles?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.profiles?.full_name}</span> checked in
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {new Date(activity.check_in).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <SparklesIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {[
              {
                title: 'Assign New Task',
                description: 'Create and assign tasks to staff',
                icon: '📋',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50',
                action: 'assign_task'
              },
              {
                title: 'View Staff',
                description: 'Manage workforce and attendance',
                icon: '👥',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                action: 'view_staff'
              },
              {
                title: 'Generate Report',
                description: 'Create operational reports',
                icon: '📊',
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50',
                action: 'generate_report'
              }
            ].map((action, index) => (
              <button 
                key={action.action}
                onClick={() => handleQuickAction(action)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:scale-105 group"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? 'fadeInRight 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <span className="text-lg">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent?.title}
        size="md"
      >
        {modalContent && (
          <div className="text-center py-6">
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${modalContent.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <span className="text-2xl">{modalContent.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalContent.title}</h3>
            <p className="text-gray-600 mb-6">{modalContent.description}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle action
                  setShowModal(false)
                }}
                className={`flex-1 bg-gradient-to-r ${modalContent.color} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200`}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Overview
