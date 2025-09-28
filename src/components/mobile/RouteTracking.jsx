import { useState, useEffect } from 'react'
import { MapPinIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import GPSLocation from './GPSLocation'

const RouteTracking = ({ route, onRouteUpdate }) => {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [routeProgress, setRouteProgress] = useState([])
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        getCurrentLocation()
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isTracking])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)
        
        // Add to route progress
        setRouteProgress(prev => [...prev, location])
        
        if (onRouteUpdate) {
          onRouteUpdate(location)
        }
      },
      (error) => {
        console.error('Location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    )
  }

  const startTracking = () => {
    setIsTracking(true)
    setStartTime(new Date())
    getCurrentLocation()
  }

  const stopTracking = () => {
    setIsTracking(false)
    setStartTime(null)
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getElapsedTime = () => {
    if (!startTime) return '00:00:00'
    const elapsed = new Date() - startTime
    const hours = Math.floor(elapsed / 3600000)
    const minutes = Math.floor((elapsed % 3600000) / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Route Information */}
      <div className="card">
        <div className="flex items-center space-x-3">
          <TruckIcon className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{route?.name}</h3>
            <p className="text-sm text-gray-600">{route?.barangay}</p>
            <p className="text-xs text-gray-500">
              Estimated Duration: {route?.estimated_duration} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Route Tracking</h4>
            <p className="text-sm text-gray-600">
              {isTracking ? 'Currently tracking route' : 'Ready to start tracking'}
            </p>
          </div>
          <div className="flex space-x-2">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="btn-primary flex items-center space-x-2"
              >
                <MapPinIcon className="h-4 w-4" />
                <span>Start Route</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>End Route</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current Status */}
      {isTracking && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {getElapsedTime()}
            </div>
            <div className="text-sm text-gray-500">Elapsed Time</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {routeProgress.length}
            </div>
            <div className="text-sm text-gray-500">Location Updates</div>
          </div>
        </div>
      )}

      {/* Current Location */}
      {currentLocation && (
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Current Location</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Latitude:</span>
              <span className="font-medium">{currentLocation.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Longitude:</span>
              <span className="font-medium">{currentLocation.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-medium">±{Math.round(currentLocation.accuracy)}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">
                {new Date(currentLocation.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Route Progress */}
      {routeProgress.length > 0 && (
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-2">Route Progress</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {routeProgress.slice(-5).map((point, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="flex-1">
                  <span className="font-medium">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </span>
                </div>
                <span className="text-gray-500">
                  {new Date(point.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteTracking
