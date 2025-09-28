# GPS Tagging for Attendance System Guide

## Overview
This guide explains the enhanced GPS tagging functionality for the attendance system, including location validation, distance calculation, and real-time location tracking.

## Key Features

### 1. Enhanced GPS Location Component
**Location**: `src/components/mobile/GPSLocation.jsx`

**New Features**:
- ✅ **Location Validation**: Validates current location against expected location
- ✅ **Distance Calculation**: Uses Haversine formula for accurate distance measurement
- ✅ **Visual Indicators**: Shows location validity with color-coded status
- ✅ **Tolerance Settings**: Configurable distance tolerance (default: 100m)
- ✅ **Error Handling**: Comprehensive error messages for different GPS issues
- ✅ **Real-time Updates**: Continuous location monitoring

### 2. GPS-Enhanced QR Code Scanning
**Location**: `src/components/mobile/MobileInterface.jsx`

**Enhanced Features**:
- ✅ **Location Validation**: Validates staff location against QR code location
- ✅ **Distance Verification**: Ensures staff is within 100m of QR code location
- ✅ **Automatic GPS Capture**: Captures current GPS coordinates during check-in
- ✅ **Location Notes**: Records distance from QR code in attendance notes
- ✅ **Error Prevention**: Prevents attendance if location is too far from QR code

## Technical Implementation

### GPS Location Validation
```javascript
// Calculate distance between two coordinates
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
```

### Location Validation Process
1. **QR Code Scan**: Staff scans QR code containing location data
2. **GPS Capture**: System captures current GPS coordinates
3. **Distance Calculation**: Calculates distance between QR location and current location
4. **Validation**: Checks if distance is within tolerance (100m)
5. **Attendance Recording**: Records attendance with validated GPS coordinates

### Enhanced GPS Location Component Props
```javascript
<GPSLocation
  onLocationUpdate={(location) => {
    // Handle location updates
  }}
  isRequired={true}                    // Require location capture
  validateLocation={true}              // Enable location validation
  expectedLocation={{                  // Expected location for validation
    lat: 17.87,
    lng: 120.46
  }}
/>
```

## Usage Instructions

### For Staff (Mobile Interface)

#### 1. Check-in with GPS Validation
1. **Open Mobile Interface**: Navigate to the mobile app
2. **Enable Location**: Ensure location services are enabled
3. **Scan QR Code**: Use QR scanner to scan admin's QR code
4. **Location Validation**: System automatically validates your location
5. **Confirmation**: Receive confirmation with location details

#### 2. GPS Location Display
- **Green Status**: Location captured and valid
- **Red Status**: Location invalid or too far from expected location
- **Distance Info**: Shows distance from expected location
- **Accuracy Info**: Displays GPS accuracy in meters

#### 3. Troubleshooting GPS Issues
- **Permission Denied**: Allow location access in browser settings
- **Location Unavailable**: Check GPS settings and signal strength
- **Timeout**: Move to area with better GPS signal
- **Too Far**: Move closer to QR code location (within 100m)

### For Admins (Dashboard)

#### 1. Monitor GPS-Tagged Attendance
1. **Navigate to Attendance**: Go to Attendance Management
2. **View Records**: See all attendance with GPS coordinates
3. **Location Verification**: Check staff locations on map
4. **Distance Analysis**: Review distance from QR code locations

#### 2. GPS Data in Attendance Records
- **Check-in Location**: GPS coordinates of check-in
- **Distance from QR**: Distance from QR code location
- **Accuracy**: GPS accuracy at time of check-in
- **Timestamp**: Exact time of location capture

## GPS Features

### 1. Location Validation
- ✅ **Distance Tolerance**: 100-meter radius validation
- ✅ **Real-time Validation**: Continuous location checking
- ✅ **Visual Feedback**: Color-coded validation status
- ✅ **Error Prevention**: Blocks attendance if location invalid

### 2. Enhanced Accuracy
- ✅ **High Accuracy Mode**: Uses GPS for best accuracy
- ✅ **Timeout Handling**: 15-second timeout for location requests
- ✅ **Cache Management**: 1-minute cache for location data
- ✅ **Error Recovery**: Automatic retry on location errors

### 3. Security Features
- ✅ **Location Verification**: Prevents remote attendance
- ✅ **Distance Tracking**: Records exact distance from QR location
- ✅ **Timestamp Validation**: Ensures location is current
- ✅ **Accuracy Monitoring**: Tracks GPS accuracy levels

## Error Handling

### Common GPS Errors
1. **Permission Denied**: User denied location access
2. **Position Unavailable**: GPS signal not available
3. **Timeout**: Location request took too long
4. **Location Too Far**: Staff is outside 100m radius

### Error Messages
- **"Location access denied by user"**: Enable location permissions
- **"Location information unavailable"**: Check GPS signal strength
- **"Location request timed out"**: Move to area with better signal
- **"Location too far from expected location"**: Move closer to QR code

## Configuration Options

### GPS Settings
```javascript
{
  enableHighAccuracy: true,    // Use GPS for best accuracy
  timeout: 15000,             // 15-second timeout
  maximumAge: 60000           // 1-minute cache
}
```

### Validation Settings
```javascript
{
  tolerance: 100,             // 100-meter tolerance
  validateLocation: true,     // Enable validation
  expectedLocation: {         // Expected coordinates
    lat: 17.87,
    lng: 120.46
  }
}
```

## Benefits

### For Staff
- ✅ **Accurate Tracking**: Precise location recording
- ✅ **Visual Feedback**: Clear status indicators
- ✅ **Error Prevention**: Prevents invalid attendance
- ✅ **Easy Use**: Simple one-tap location capture

### For Admins
- ✅ **Location Verification**: Confirm staff presence
- ✅ **Distance Analysis**: Track staff movement
- ✅ **Security**: Prevent remote attendance
- ✅ **Audit Trail**: Complete location history

### For System
- ✅ **Data Integrity**: Validated location data
- ✅ **Security**: Location-based attendance verification
- ✅ **Accuracy**: High-precision GPS tracking
- ✅ **Reliability**: Robust error handling

## Future Enhancements
- **Geofencing**: Define specific areas for attendance
- **Route Tracking**: Track staff movement during work
- **Location Analytics**: Analyze attendance patterns
- **Offline GPS**: Cache location data for offline use
- **Map Integration**: Visual location display on maps
