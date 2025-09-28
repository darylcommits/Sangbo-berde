import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  MapIcon, 
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  GlobeAltIcon,
  SignalIcon
} from '@heroicons/react/24/outline'

const LocationAnalytics = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [locationStats, setLocationStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showLocationDetails, setShowLocationDetails] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [heatmapData, setHeatmapData] = useState([])
  const [locationClusters, setLocationClusters] = useState([])

  useEffect(() => {
    fetchLocationData()
  }, [dateRange])

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          staff:profiles!staff_id(full_name, role, barangay)
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Attendance table error:', error)
        // Fallback to local storage
        const localAttendance = JSON.parse(localStorage.getItem('attendance') || '[]')
        const filteredAttendance = localAttendance.filter(record => 
          record.location_lat && record.location_lng &&
          new Date(record.created_at) >= new Date(dateRange.start) &&
          new Date(record.created_at) <= new Date(dateRange.end)
        )
        setAttendanceData(filteredAttendance)
        calculateLocationStats(filteredAttendance)
      } else {
        console.log('Successfully fetched attendance from database:', data?.length || 0)
        setAttendanceData(data || [])
        calculateLocationStats(data || [])
      }
    } catch (error) {
      console.error('Error fetching location data:', error)
      setAttendanceData([])
    } finally {
      setLoading(false)
    }
  }

  const calculateLocationStats = (data) => {
    const stats = {
      totalRecords: data.length,
      uniqueLocations: new Set(data.map(d => `${d.location_lat},${d.location_lng}`)).size,
      averageAccuracy: 0,
      locationDistribution: {},
      timeDistribution: {},
      accuracyStats: {
        excellent: 0, // < 5m
        good: 0,      // 5-10m
        fair: 0,      // 10-20m
        poor: 0       // > 20m
      },
      distanceStats: {
        totalDistance: 0,
        averageDistance: 0,
        maxDistance: 0,
        minDistance: Infinity
      },
      staffStats: {},
      locationClusters: [],
      heatmapData: [],
      coverageStats: {
        totalArea: 0,
        coverageRadius: 0,
        densityScore: 0
      }
    }

    if (data.length === 0) {
      setLocationStats(stats)
      return
    }

    // Calculate accuracy statistics
    let totalAccuracy = 0
    data.forEach(record => {
      if (record.accuracy) {
        totalAccuracy += record.accuracy
        if (record.accuracy < 5) stats.accuracyStats.excellent++
        else if (record.accuracy < 10) stats.accuracyStats.good++
        else if (record.accuracy < 20) stats.accuracyStats.fair++
        else stats.accuracyStats.poor++
      }
    })
    stats.averageAccuracy = totalAccuracy / data.length

    // Calculate location distribution
    data.forEach(record => {
      const location = `${record.location_lat},${record.location_lng}`
      stats.locationDistribution[location] = (stats.locationDistribution[location] || 0) + 1
    })

    // Calculate time distribution
    data.forEach(record => {
      const hour = new Date(record.created_at).getHours()
      stats.timeDistribution[hour] = (stats.timeDistribution[hour] || 0) + 1
    })

    // Calculate staff statistics
    data.forEach(record => {
      const staffId = record.staff_id
      if (!stats.staffStats[staffId]) {
        stats.staffStats[staffId] = {
          name: record.staff?.full_name || 'Unknown',
          role: record.staff?.role || 'Unknown',
          totalRecords: 0,
          averageAccuracy: 0,
          locations: []
        }
      }
      stats.staffStats[staffId].totalRecords++
      stats.staffStats[staffId].locations.push({
        lat: parseFloat(record.location_lat),
        lng: parseFloat(record.location_lng),
        accuracy: record.accuracy,
        timestamp: record.created_at
      })
    })

    // Calculate average accuracy per staff
    Object.keys(stats.staffStats).forEach(staffId => {
      const staff = stats.staffStats[staffId]
      const totalAccuracy = staff.locations.reduce((sum, loc) => sum + (loc.accuracy || 0), 0)
      staff.averageAccuracy = totalAccuracy / staff.locations.length
    })

    // Generate heatmap data
    const heatmapPoints = data.map(record => ({
      lat: parseFloat(record.location_lat),
      lng: parseFloat(record.location_lng),
      weight: 1,
      accuracy: record.accuracy,
      timestamp: record.created_at
    }))
    stats.heatmapData = heatmapPoints

    // Calculate location clusters
    const clusters = calculateLocationClusters(heatmapPoints)
    stats.locationClusters = clusters

    // Calculate coverage statistics
    if (heatmapPoints.length > 0) {
      const bounds = calculateBounds(heatmapPoints)
      stats.coverageStats.totalArea = calculateArea(bounds)
      stats.coverageStats.coverageRadius = calculateCoverageRadius(heatmapPoints)
      stats.coverageStats.densityScore = calculateDensityScore(heatmapPoints, bounds)
    }

    // Calculate distance statistics (if we have reference points)
    const referenceLat = 17.87 // Default reference point
    const referenceLng = 120.46
    
    data.forEach(record => {
      const distance = calculateDistance(
        referenceLat, referenceLng,
        parseFloat(record.location_lat), parseFloat(record.location_lng)
      )
      stats.distanceStats.totalDistance += distance
      stats.distanceStats.maxDistance = Math.max(stats.distanceStats.maxDistance, distance)
      stats.distanceStats.minDistance = Math.min(stats.distanceStats.minDistance, distance)
    })
    
    stats.distanceStats.averageDistance = stats.distanceStats.totalDistance / data.length

    setLocationStats(stats)
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Helper functions for enhanced analytics
  const calculateLocationClusters = (points) => {
    if (points.length === 0) return []
    
    const clusters = []
    const visited = new Set()
    const clusterRadius = 0.001 // ~100m in degrees
    
    points.forEach((point, index) => {
      if (visited.has(index)) return
      
      const cluster = {
        center: { lat: point.lat, lng: point.lng },
        points: [point],
        count: 1,
        radius: clusterRadius
      }
      
      // Find nearby points
      points.forEach((otherPoint, otherIndex) => {
        if (visited.has(otherIndex) || index === otherIndex) return
        
        const distance = calculateDistance(
          point.lat, point.lng,
          otherPoint.lat, otherPoint.lng
        )
        
        if (distance <= 100) { // 100m cluster radius
          cluster.points.push(otherPoint)
          cluster.count++
          visited.add(otherIndex)
        }
      })
      
      if (cluster.count > 1) {
        // Calculate cluster center
        const avgLat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length
        const avgLng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length
        cluster.center = { lat: avgLat, lng: avgLng }
        clusters.push(cluster)
      }
      
      visited.add(index)
    })
    
    return clusters.sort((a, b) => b.count - a.count)
  }

  const calculateBounds = (points) => {
    if (points.length === 0) return null
    
    const lats = points.map(p => p.lat)
    const lngs = points.map(p => p.lng)
    
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }

  const calculateArea = (bounds) => {
    if (!bounds) return 0
    
    const latDiff = bounds.north - bounds.south
    const lngDiff = bounds.east - bounds.west
    
    // Approximate area calculation (simplified)
    return latDiff * lngDiff * 111000 * 111000 // Convert to square meters
  }

  const calculateCoverageRadius = (points) => {
    if (points.length === 0) return 0
    
    const bounds = calculateBounds(points)
    if (!bounds) return 0
    
    const centerLat = (bounds.north + bounds.south) / 2
    const centerLng = (bounds.east + bounds.west) / 2
    
    let maxDistance = 0
    points.forEach(point => {
      const distance = calculateDistance(
        centerLat, centerLng,
        point.lat, point.lng
      )
      maxDistance = Math.max(maxDistance, distance)
    })
    
    return maxDistance
  }

  const calculateDensityScore = (points, bounds) => {
    if (points.length === 0 || !bounds) return 0
    
    const area = calculateArea(bounds)
    return points.length / (area / 1000000) // Points per square kilometer
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 5) return 'text-green-600 bg-green-100'
    if (accuracy < 10) return 'text-blue-600 bg-blue-100'
    if (accuracy < 20) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAccuracyLabel = (accuracy) => {
    if (accuracy < 5) return 'Excellent'
    if (accuracy < 10) return 'Good'
    if (accuracy < 20) return 'Fair'
    return 'Poor'
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
          <h2 className="text-2xl font-bold text-gray-900">Location Analytics</h2>
          <p className="text-gray-600">GPS data analysis and location insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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
            <div className="flex-shrink-0 p-3 rounded-md bg-blue-500">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{locationStats.totalRecords || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-green-500">
              <MapPinIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unique Locations</p>
              <p className="text-2xl font-semibold text-gray-900">{locationStats.uniqueLocations || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {locationStats.averageAccuracy ? `${locationStats.averageAccuracy.toFixed(1)}m` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-md bg-purple-500">
              <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Distance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {locationStats.distanceStats?.averageDistance ? `${locationStats.distanceStats.averageDistance.toFixed(0)}m` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">GPS Accuracy Distribution</h3>
          <div className="space-y-3">
            {locationStats.accuracyStats && Object.entries(locationStats.accuracyStats).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    level === 'excellent' ? 'bg-green-500' :
                    level === 'good' ? 'bg-blue-500' :
                    level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">{level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level === 'excellent' ? 'bg-green-500' :
                        level === 'good' ? 'bg-blue-500' :
                        level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(count / locationStats.totalRecords) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Distribution</h3>
          <div className="space-y-2">
            {locationStats.timeDistribution && Object.entries(locationStats.timeDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([hour, count]) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{hour}:00</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(locationStats.timeDistribution))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Location Records */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {record.staff?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.staff?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.staff?.role || 'Unknown Role'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.location_lat?.toFixed(6)}, {record.location_lng?.toFixed(6)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.notes || 'No notes'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.accuracy ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccuracyColor(record.accuracy)}`}>
                        {getAccuracyLabel(record.accuracy)} ({record.accuracy.toFixed(1)}m)
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendanceData.length === 0 && (
          <div className="text-center py-8">
            <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No location data found for the selected date range</p>
          </div>
        )}
      </div>

      {/* Distance Statistics */}
      {locationStats.distanceStats && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distance Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {locationStats.distanceStats.totalDistance.toFixed(0)}m
              </div>
              <div className="text-sm text-gray-500">Total Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {locationStats.distanceStats.averageDistance.toFixed(0)}m
              </div>
              <div className="text-sm text-gray-500">Average Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {locationStats.distanceStats.maxDistance.toFixed(0)}m
              </div>
              <div className="text-sm text-gray-500">Maximum Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {locationStats.distanceStats.minDistance === Infinity ? 'N/A' : locationStats.distanceStats.minDistance.toFixed(0) + 'm'}
              </div>
              <div className="text-sm text-gray-500">Minimum Distance</div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Performance */}
      {locationStats.staffStats && Object.keys(locationStats.staffStats).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Performance</h3>
          <div className="space-y-4">
            {Object.entries(locationStats.staffStats).map(([staffId, staff]) => (
              <div key={staffId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {staff.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{staff.name}</h4>
                      <p className="text-sm text-gray-500">{staff.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{staff.totalRecords}</div>
                    <div className="text-sm text-gray-500">Records</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Average Accuracy</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {staff.averageAccuracy.toFixed(1)}m
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Locations</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {staff.locations.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Clusters */}
      {locationStats.locationClusters && locationStats.locationClusters.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Clusters</h3>
          <div className="space-y-3">
            {locationStats.locationClusters.slice(0, 5).map((cluster, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Cluster {index + 1}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cluster.center.lat.toFixed(6)}, {cluster.center.lng.toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{cluster.count}</div>
                    <div className="text-sm text-gray-500">Points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coverage Statistics */}
      {locationStats.coverageStats && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(locationStats.coverageStats.totalArea / 1000000).toFixed(2)} km²
              </div>
              <div className="text-sm text-gray-500">Total Coverage Area</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {locationStats.coverageStats.coverageRadius.toFixed(0)}m
              </div>
              <div className="text-sm text-gray-500">Coverage Radius</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {locationStats.coverageStats.densityScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Density Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationAnalytics
