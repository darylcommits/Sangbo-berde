import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  QrCodeIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import QRCode from 'qrcode'

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [qrCodeData, setQrCodeData] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all') // all, present, absent, late

  useEffect(() => {
    fetchAttendance()
  }, [dateFilter])

  // Listen for storage changes to update attendance in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Local storage changed, refreshing attendance...')
      fetchAttendance()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('attendanceUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('attendanceUpdated', handleStorageChange)
    }
  }, [])

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          staff:profiles!staff_id(full_name, role, barangay)
        `)
        .gte('created_at', dateFilter)
        .lte('created_at', new Date(new Date(dateFilter).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Attendance table error:', error)
        console.log('Checking local storage for attendance')
        // Check local storage for saved attendance
        const localAttendance = JSON.parse(localStorage.getItem('attendance') || '[]')
        
        if (localAttendance.length > 0) {
          console.log('Found local attendance:', localAttendance.length)
          // Add mock staff info for local attendance
          const attendanceWithStaff = localAttendance.map(record => ({
            ...record,
            staff: { full_name: 'Local Staff', role: 'collector', barangay: 'Unknown' }
          }))
          setAttendance(attendanceWithStaff)
        } else {
          // Fallback to demo attendance
          const demoAttendance = [
            {
              id: 'demo-1',
              staff_id: 'staff-1',
              check_in: new Date().toISOString(),
              check_out: null,
              location_lat: '17.87',
              location_lng: '120.46',
              status: 'present',
              notes: 'On time',
              created_at: new Date().toISOString(),
              staff: { full_name: 'John Collector', role: 'collector', barangay: 'Barangay A' }
            },
            {
              id: 'demo-2',
              staff_id: 'staff-2',
              check_in: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              check_out: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              location_lat: '17.87',
              location_lng: '120.46',
              status: 'present',
              notes: 'Completed shift',
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              staff: { full_name: 'Maria Facility', role: 'facility_staff', barangay: 'Barangay B' }
            }
          ]
          setAttendance(demoAttendance)
        }
      } else {
        console.log('Successfully fetched attendance from database:', data?.length || 0)
        // Combine database attendance with local storage attendance
        const localAttendance = JSON.parse(localStorage.getItem('attendance') || '[]')
        const attendanceWithStaff = localAttendance.map(record => ({
          ...record,
          staff: { full_name: 'Local Staff', role: 'collector', barangay: 'Unknown' }
        }))
        
        // Filter out duplicates by ID
        const existingIds = new Set((data || []).map(a => a.id))
        const uniqueLocalAttendance = attendanceWithStaff.filter(a => !existingIds.has(a.id))
        
        const allAttendance = [...(data || []), ...uniqueLocalAttendance]
        setAttendance(allAttendance)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      // Final fallback to demo attendance
      const demoAttendance = [
        {
          id: 'demo-1',
          staff_id: 'staff-1',
          check_in: new Date().toISOString(),
          check_out: null,
          location_lat: '17.87',
          location_lng: '120.46',
          status: 'present',
          notes: 'On time',
          created_at: new Date().toISOString(),
          staff: { full_name: 'John Collector', role: 'collector', barangay: 'Barangay A' }
        }
      ]
      setAttendance(demoAttendance)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      // Generate QR code data with timestamp and location
      const qrData = {
        type: 'attendance_checkin',
        timestamp: new Date().toISOString(),
        location: {
          lat: '17.87',
          lng: '120.46'
        },
        valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Valid for 30 minutes
        admin_id: 'current-admin-id'
      }
      
      const qrString = JSON.stringify(qrData)
      setQrCodeData(qrString)
      
      // Generate QR code image
      const qrUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeUrl(qrUrl)
      setShowQRGenerator(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'absent':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'late':
        return <ClockIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const handleViewAttendance = (record) => {
    setSelectedAttendance(record)
    setShowAttendanceModal(true)
  }

  const handleUpdateAttendance = async (attendanceId, updates) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', attendanceId)

      if (error) {
        console.log('Database not available, using local update')
        // Update local storage
        const localAttendance = JSON.parse(localStorage.getItem('attendance') || '[]')
        const updatedAttendance = localAttendance.map(record => 
          record.id === attendanceId 
            ? { ...record, ...updates, updated_at: new Date().toISOString() }
            : record
        )
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance))
      }
      
      // Update state
      setAttendance(prev => prev.map(record => 
        record.id === attendanceId 
          ? { ...record, ...updates, updated_at: new Date().toISOString() }
          : record
      ))
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('attendanceUpdated', { 
        detail: { attendance: updates } 
      }))
      
      alert('Attendance updated successfully!')
      fetchAttendance()
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('Failed to update attendance. Please try again.')
    }
  }

  const filteredAttendance = attendance.filter(record => {
    const statusMatch = statusFilter === 'all' || record.status === statusFilter
    return statusMatch
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
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Generate QR codes and manage staff attendance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateQRCode}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <QrCodeIcon className="h-4 w-4" />
            <span>Generate QR Code</span>
          </button>
          <button
            onClick={fetchAttendance}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <ClockIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{attendance.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Present</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendance.filter(a => a.status === 'present').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Late</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendance.filter(a => a.status === 'late').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-red-500">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {attendance.filter(a => a.status === 'absent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h3>
        <div className="space-y-4">
          {filteredAttendance.map((record) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{record.staff?.full_name || 'Unknown Staff'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{record.staff?.role || 'Unknown Role'} - {record.staff?.barangay || 'Unknown Barangay'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Check-in: {new Date(record.check_in).toLocaleString()}
                    </span>
                    {record.check_out && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Check-out: {new Date(record.check_out).toLocaleString()}
                      </span>
                    )}
                    {record.location_lat && record.location_lng && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {record.location_lat}, {record.location_lng}
                      </span>
                    )}
                  </div>
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-1">Notes: {record.notes}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    <span className="ml-1 capitalize">{record.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => handleViewAttendance(record)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline flex items-center space-x-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                {!record.check_out && (
                  <button 
                    onClick={() => handleUpdateAttendance(record.id, { 
                      check_out: new Date().toISOString(),
                      status: 'present'
                    })}
                    className="text-green-600 hover:text-green-900 text-sm font-medium hover:underline"
                  >
                    Check Out
                  </button>
                )}
                <button 
                  onClick={() => handleUpdateAttendance(record.id, { status: 'late' })}
                  className="text-yellow-600 hover:text-yellow-900 text-sm font-medium hover:underline"
                >
                  Mark Late
                </button>
              </div>
            </div>
          ))}
          
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found for the selected date</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Generator Modal */}
      {showQRGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Attendance QR Code</h3>
              <button
                onClick={() => setShowQRGenerator(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">Staff should scan this QR code to check in</p>
                {qrCodeUrl && (
                  <img 
                    src={qrCodeUrl} 
                    alt="Attendance QR Code" 
                    className="mx-auto rounded-lg shadow-lg"
                  />
                )}
              </div>
              
              <div className="text-left bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">QR Code Details:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Type:</strong> Attendance Check-in</p>
                  <p><strong>Valid Until:</strong> {new Date(JSON.parse(qrCodeData).valid_until).toLocaleString()}</p>
                  <p><strong>Location:</strong> {JSON.parse(qrCodeData).location.lat}, {JSON.parse(qrCodeData).location.lng}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowQRGenerator(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = `attendance-qr-${new Date().toISOString().split('T')[0]}.png`
                    link.href = qrCodeUrl
                    link.click()
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Details Modal */}
      {showAttendanceModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Attendance Details</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Staff Member</label>
                  <p className="text-gray-900">{selectedAttendance.staff?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900">{selectedAttendance.staff?.role || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-in Time</label>
                  <p className="text-gray-900">{new Date(selectedAttendance.check_in).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Check-out Time</label>
                  <p className="text-gray-900">
                    {selectedAttendance.check_out ? new Date(selectedAttendance.check_out).toLocaleString() : 'Not checked out'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAttendance.status)}`}>
                    {getStatusIcon(selectedAttendance.status)}
                    <span className="ml-1 capitalize">{selectedAttendance.status}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">
                    {selectedAttendance.location_lat && selectedAttendance.location_lng 
                      ? `${selectedAttendance.location_lat}, ${selectedAttendance.location_lng}`
                      : 'Not available'
                    }
                  </p>
                </div>
              </div>
              
              {selectedAttendance.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAttendance.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceManagement
