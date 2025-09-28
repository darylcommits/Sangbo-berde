import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  PlusIcon, 
  UserPlusIcon, 
  ClockIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

const WorkforceManagement = () => {
  const [staff, setStaff] = useState([])
  const [attendance, setAttendance] = useState([])
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
    fetchTodayAttendance()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['collector', 'facility_staff', 'supervisor'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles!inner(full_name, role, phone)
        `)
        .gte('check_in', today)
        .order('check_in', { ascending: false })

      if (error) throw error
      setAttendance(data || [])
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStatus = (staffId) => {
    const todayAttendance = attendance.find(a => a.staff_id === staffId)
    if (!todayAttendance) return { status: 'absent', color: 'text-red-600' }
    if (todayAttendance.check_out) return { status: 'completed', color: 'text-green-600' }
    return { status: 'present', color: 'text-blue-600' }
  }

  const AddStaffForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Staff Member</h3>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select className="input-field">
                <option value="collector">Garbage Collector</option>
                <option value="facility_staff">Facility Staff</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Barangay</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter barangay"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Add Staff
              </button>
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  const handleAddStaff = async (e) => {
    e.preventDefault()
    // Implementation for adding staff
    setShowAddStaff(false)
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Workforce Management</h2>
          <p className="text-gray-600">Manage staff, attendance, and performance</p>
        </div>
        <button
          onClick={() => setShowAddStaff(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Today's Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendance.filter(a => !a.check_out).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-red-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Absent Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {staff.length - attendance.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Shifts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendance.filter(a => a.check_out).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Directory</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Today's Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => {
                const attendanceStatus = getAttendanceStatus(member.id)
                return (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {member.full_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.barangay}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${attendanceStatus.color}`}>
                        {attendanceStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddStaff && <AddStaffForm />}
    </div>
  )
}

export default WorkforceManagement
