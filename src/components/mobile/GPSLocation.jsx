import { useState, useEffect } from 'react'
import { MapPinIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const GPSLocation = ({ onLocationUpdate, isRequired = false, validateLocation = false, expectedLocation = null }) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locationValid, setLocationValid] = useState(false)
  const [distanceFromExpected, setDistanceFromExpected] = useState(null)

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

  const validateLocationDistance = (currentLocation, expectedLocation) => {
    if (!expectedLocation) return true
    
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      expectedLocation.lat,
      expectedLocation.lng
    )
    
    setDistanceFromExpected(distance)
    
    // Allow 100 meters tolerance for location validation
    const isValid = distance <= 100
    setLocationValid(isValid)
    
    return isValid
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        }
        
        // Validate location if required
        if (validateLocation && expectedLocation) {
          const isValid = validateLocationDistance(newLocation, expectedLocation)
          if (!isValid) {
            setError(`Location too far from expected location. Distance: ${Math.round(distanceFromExpected)}m`)
            setLoading(false)
            return
          }
        }
        
        setLocation(newLocation)
        if (onLocationUpdate) {
          onLocationUpdate(newLocation)
        }
        setLoading(false)
      },
      (error) => {
        let errorMessage = 'Location error: '
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out'
            break
          default:
            errorMessage += error.message
            break
        }
        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute
      }
    )
  }

  useEffect(() => {
    if (isRequired) {
      getCurrentLocation()
    }
  }, [isRequired])

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <MapPinIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Location</span>
        {isRequired && <span className="text-red-500">*</span>}
      </div>
      
      {location ? (
        <div className={`p-3 border rounded-lg ${
          validateLocation && expectedLocation 
            ? (locationValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {validateLocation && expectedLocation ? (
                  locationValid ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  )
                ) : (
                  <MapPinIcon className="h-4 w-4 text-green-600" />
                )}
                <p className={`text-sm font-medium ${
                  validateLocation && expectedLocation 
                    ? (locationValid ? 'text-green-800' : 'text-red-800')
                    : 'text-green-800'
                }`}>
                  {validateLocation && expectedLocation 
                    ? (locationValid ? 'Location Valid' : 'Location Invalid')
                    : 'Location Captured'
                  }
                </p>
              </div>
              <p className="text-xs text-gray-600">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </p>
              <p className="text-xs text-gray-600">
                Accuracy: ±{Math.round(location.accuracy)}m
              </p>
              {validateLocation && expectedLocation && distanceFromExpected !== null && (
                <p className={`text-xs ${
                  locationValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  Distance from expected: {Math.round(distanceFromExpected)}m
                  {locationValid ? ' (Valid)' : ' (Too far)'}
                </p>
              )}
            </div>
            <button
              onClick={getCurrentLocation}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2"
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">
                {loading ? 'Getting location...' : 'Location not captured'}
              </p>
              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="btn-primary text-sm"
            >
              {loading ? 'Getting...' : 'Get Location'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GPSLocation
