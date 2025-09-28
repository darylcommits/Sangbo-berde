import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { DocumentChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [citizenReports, setCitizenReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last year
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next year
  })

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  // Listen for storage changes to update reports in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Local storage changed, refreshing reports...')
      fetchReports()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('citizenReportSubmitted', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('citizenReportSubmitted', handleStorageChange)
    }
  }, [])

  const fetchReports = async () => {
    try {
      // Fetch citizen reports
      const { data: citizenReportsData, error } = await supabase
        .from('citizen_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(full_name, barangay),
          assigned_to_profile:profiles!assigned_to(full_name)
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Citizen reports table error:', error)
        console.log('Checking local storage for additional reports')
        // Check local storage for saved reports
        const localReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]')
        
        if (localReports.length > 0) {
          console.log('Found local reports for admin view:', localReports.length)
          // Add mock reporter info for local reports
          const reportsWithReporter = localReports.map(report => ({
            ...report,
            reporter: { full_name: 'Local User', barangay: 'Unknown' }
          }))
          setCitizenReports(reportsWithReporter)
        } else {
          // Fallback to demo reports
          const demoReports = [
            {
              id: 'demo-1',
              report_type: 'missed_collection',
              title: 'Missed Garbage Collection',
              description: 'Our garbage was not collected on the scheduled day. Please arrange for collection.',
              address: '123 Main Street, Barangay A',
              priority: 'high',
              status: 'pending',
              created_at: new Date().toISOString(),
              reporter: { full_name: 'Demo User', barangay: 'Barangay A' }
            },
            {
              id: 'demo-2',
              report_type: 'illegal_dumping',
              title: 'Illegal Dumping in Park',
              description: 'Someone has been dumping construction waste in the public park.',
              address: 'City Park, Barangay B',
              priority: 'urgent',
              status: 'assigned',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              reporter: { full_name: 'Demo User 2', barangay: 'Barangay B' }
            }
          ]
          setCitizenReports(demoReports)
        }
      } else {
        console.log('Successfully fetched reports from database:', citizenReportsData?.length || 0)
        // Combine database reports with local storage reports
        const localReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]')
        const reportsWithReporter = localReports.map(report => ({
          ...report,
          reporter: { full_name: 'Local User', barangay: 'Unknown' }
        }))
        
        // Filter out duplicates by ID
        const existingIds = new Set((citizenReportsData || []).map(r => r.id))
        const uniqueLocalReports = reportsWithReporter.filter(r => !existingIds.has(r.id))
        
        const allReports = [...(citizenReportsData || []), ...uniqueLocalReports]
        setCitizenReports(allReports)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      // Final fallback to demo reports
      const demoReports = [
        {
          id: 'demo-1',
          report_type: 'missed_collection',
          title: 'Missed Garbage Collection',
          description: 'Our garbage was not collected on the scheduled day. Please arrange for collection.',
          address: '123 Main Street, Barangay A',
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString(),
          reporter: { full_name: 'Demo User', barangay: 'Barangay A' }
        }
      ]
      setCitizenReports(demoReports)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
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

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'missed_collection':
        return '🗑️'
      case 'illegal_dumping':
        return '⚠️'
      case 'overflow_bin':
        return '📦'
      case 'environmental_complaint':
        return '🌱'
      default:
        return '📋'
    }
  }

  const handleViewDetails = (report) => {
    console.log('Viewing report details:', report)
    alert(`Report Details:\n\nTitle: ${report.title}\nDescription: ${report.description}\nStatus: ${report.status}\nPriority: ${report.priority}\nReporter: ${report.reporter?.full_name}`)
  }

  const handleAssignReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('citizen_reports')
        .update({ 
          status: 'assigned',
          assigned_to: 'current-user-id' // You might want to get this from auth context
        })
        .eq('id', reportId)

      if (error) {
        console.log('Database not available, using local update')
        // Update local storage
        const localReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]')
        const updatedReports = localReports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'assigned', assigned_to: 'current-user-id' }
            : report
        )
        localStorage.setItem('citizen_reports', JSON.stringify(updatedReports))
      }
      
      alert('Report assigned successfully!')
      fetchReports() // Refresh the data
    } catch (error) {
      console.error('Error assigning report:', error)
      alert('Failed to assign report. Please try again.')
    }
  }

  const handleResolveReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('citizen_reports')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) {
        console.log('Database not available, using local update')
        // Update local storage
        const localReports = JSON.parse(localStorage.getItem('citizen_reports') || '[]')
        const updatedReports = localReports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'resolved', updated_at: new Date().toISOString() }
            : report
        )
        localStorage.setItem('citizen_reports', JSON.stringify(updatedReports))
      }
      
      alert('Report resolved successfully!')
      fetchReports() // Refresh the data
    } catch (error) {
      console.error('Error resolving report:', error)
      alert('Failed to resolve report. Please try again.')
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Reports & Complaints</h2>
          <p className="text-gray-600">Manage citizen reports and complaints</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchReports}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <DocumentChartBarIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="input-field"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-semibold text-gray-900">{citizenReports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {citizenReports.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {citizenReports.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {citizenReports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Citizen Reports</h3>
        <div className="space-y-4">
          {citizenReports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getReportTypeIcon(report.report_type)}</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        By: {report.reporter?.full_name} ({report.reporter?.barangay})
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.address && (
                        <span className="text-xs text-gray-500">
                          📍 {report.address}
                        </span>
                      )}
                    </div>
                    {report.assigned_to_profile && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Assigned to: {report.assigned_to_profile.full_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                    {report.priority} priority
                  </span>
                </div>
              </div>
              
              {report.photos && report.photos.length > 0 && (
                <div className="mt-3">
                  <div className="flex space-x-2">
                    {report.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Report photo ${index + 1}`}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => handleViewDetails(report)}
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium hover:underline"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleAssignReport(report.id)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
                >
                  Assign
                </button>
                <button 
                  onClick={() => handleResolveReport(report.id)}
                  className="text-green-600 hover:text-green-900 text-sm font-medium hover:underline"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
          
          {citizenReports.length === 0 && (
            <div className="text-center py-8">
              <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports found for the selected date range</p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Date range: {dateRange.start} to {dateRange.end}</p>
                <p>Local storage reports: {JSON.parse(localStorage.getItem('citizen_reports') || '[]').length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
