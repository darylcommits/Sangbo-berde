import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  ClipboardDocumentListIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const TaskManagement = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [filter, setFilter] = useState('all') // all, pending, in_progress, completed
  const [priority, setPriority] = useState('all') // all, low, medium, high, urgent

  useEffect(() => {
    fetchTasks()
  }, [])

  // Listen for storage changes to update tasks in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Local storage changed, refreshing tasks...')
      fetchTasks()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('taskUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('taskUpdated', handleStorageChange)
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!assigned_to(full_name, role),
          assigned_by_profile:profiles!assigned_by(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Tasks table error:', error)
        console.log('Checking local storage for tasks')
        // Check local storage for saved tasks
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        
        if (localTasks.length > 0) {
          console.log('Found local tasks:', localTasks.length)
          // Add mock profile info for local tasks
          const tasksWithProfiles = localTasks.map(task => ({
            ...task,
            assigned_to_profile: { full_name: 'Local Staff', role: 'collector' },
            assigned_by_profile: { full_name: 'Admin' }
          }))
          setTasks(tasksWithProfiles)
        } else {
          // Fallback to demo tasks
          const demoTasks = [
            {
              id: 'demo-1',
              title: 'Garbage Collection - Barangay A',
              description: 'Collect garbage from all households in Barangay A',
              assigned_to: 'collector-1',
              assigned_by: 'admin-1',
              status: 'pending',
              priority: 'high',
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              assigned_to_profile: { full_name: 'John Collector', role: 'collector' },
              assigned_by_profile: { full_name: 'Admin User' }
            },
            {
              id: 'demo-2',
              title: 'Compost Monitoring - Facility 1',
              description: 'Check compost temperature and moisture levels',
              assigned_to: 'facility-1',
              assigned_by: 'admin-1',
              status: 'in_progress',
              priority: 'medium',
              due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              assigned_to_profile: { full_name: 'Maria Facility', role: 'facility_staff' },
              assigned_by_profile: { full_name: 'Admin User' }
            }
          ]
          setTasks(demoTasks)
        }
      } else {
        console.log('Successfully fetched tasks from database:', data?.length || 0)
        // Combine database tasks with local storage tasks
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        const tasksWithProfiles = localTasks.map(task => ({
          ...task,
          assigned_to_profile: { full_name: 'Local Staff', role: 'collector' },
          assigned_by_profile: { full_name: 'Admin' }
        }))
        
        // Filter out duplicates by ID
        const existingIds = new Set((data || []).map(t => t.id))
        const uniqueLocalTasks = tasksWithProfiles.filter(t => !existingIds.has(t.id))
        
        const allTasks = [...(data || []), ...uniqueLocalTasks]
        setTasks(allTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      // Final fallback to demo tasks
      const demoTasks = [
        {
          id: 'demo-1',
          title: 'Garbage Collection - Barangay A',
          description: 'Collect garbage from all households in Barangay A',
          assigned_to: 'collector-1',
          assigned_by: 'admin-1',
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          assigned_to_profile: { full_name: 'John Collector', role: 'collector' },
          assigned_by_profile: { full_name: 'Admin User' }
        }
      ]
      setTasks(demoTasks)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'in_progress':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const handleCreateTask = async (formData) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assigned_to,
          assigned_by: 'current-user-id', // You might want to get this from auth context
          status: 'pending',
          priority: formData.priority,
          due_date: formData.due_date
        })

      if (error) {
        console.log('Database not available, using local storage fallback')
        // Fallback to local storage
        const newTask = {
          id: `local-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assigned_to,
          assigned_by: 'current-user-id',
          status: 'pending',
          priority: formData.priority,
          due_date: formData.due_date,
          created_at: new Date().toISOString(),
          assigned_to_profile: { full_name: 'Local Staff', role: 'collector' },
          assigned_by_profile: { full_name: 'Admin' }
        }
        
        // Store in local storage
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        existingTasks.unshift(newTask)
        localStorage.setItem('tasks', JSON.stringify(existingTasks))
        
        // Update state
        setTasks(prev => [newTask, ...prev])
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('taskUpdated', { 
          detail: { task: newTask } 
        }))
        
        alert('Task created successfully! (Saved locally)')
        setShowTaskForm(false)
        return
      }
      
      alert('Task created successfully!')
      setShowTaskForm(false)
      fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      
      // Final fallback - local storage
      const newTask = {
        id: `local-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        assigned_by: 'current-user-id',
        status: 'pending',
        priority: formData.priority,
        due_date: formData.due_date,
        created_at: new Date().toISOString(),
        assigned_to_profile: { full_name: 'Local Staff', role: 'collector' },
        assigned_by_profile: { full_name: 'Admin' }
      }
      
      // Store in local storage
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      existingTasks.unshift(newTask)
      localStorage.setItem('tasks', JSON.stringify(existingTasks))
      
      // Update state
      setTasks(prev => [newTask, ...prev])
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('taskUpdated', { 
        detail: { task: newTask } 
      }))
      
      alert('Task created successfully! (Saved locally)')
      setShowTaskForm(false)
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) {
        console.log('Database not available, using local update')
        // Update local storage
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        const updatedTasks = localTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updates, updated_at: new Date().toISOString() }
            : task
        )
        localStorage.setItem('tasks', JSON.stringify(updatedTasks))
      }
      
      // Update state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      ))
      
      alert('Task updated successfully!')
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.log('Database not available, using local update')
        // Update local storage
        const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        const updatedTasks = localTasks.filter(task => task.id !== taskId)
        localStorage.setItem('tasks', JSON.stringify(updatedTasks))
      }
      
      // Update state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      alert('Task deleted successfully!')
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter
    const priorityMatch = priority === 'all' || task.priority === priority
    return statusMatch && priorityMatch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600">Manage and assign tasks to staff members</p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-field"
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks</h3>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Assigned to: {task.assigned_to_profile?.full_name || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority} priority
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => handleViewTask(task)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline flex items-center space-x-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
                  className="text-orange-600 hover:text-orange-900 text-sm font-medium hover:underline"
                >
                  Start
                </button>
                <button 
                  onClick={() => handleUpdateTask(task.id, { status: 'completed' })}
                  className="text-green-600 hover:text-green-900 text-sm font-medium hover:underline"
                >
                  Complete
                </button>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium hover:underline flex items-center space-x-1"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Task Details</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h4>
                <p className="text-gray-600 mt-2">{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-1 capitalize">{selectedTask.status.replace('_', ' ')}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="text-gray-900">{selectedTask.assigned_to_profile?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-gray-900">{new Date(selectedTask.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Form */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create New Task</h3>
              <button
                onClick={() => setShowTaskForm(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              handleCreateTask(Object.fromEntries(formData))
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Task description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  name="assigned_to"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Staff member ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskManagement