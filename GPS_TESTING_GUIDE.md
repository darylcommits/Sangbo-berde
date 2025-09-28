# GPS Functionality Testing Guide

## Overview
This guide provides comprehensive testing procedures for the GPS functionality in the SANGBO BERDE attendance system, including real device testing and location validation.

## Pre-Testing Setup

### 1. Environment Requirements
- **HTTPS Required**: GPS functionality requires HTTPS in production
- **Location Permissions**: Browser must have location access permissions
- **GPS Signal**: Test in areas with good GPS signal strength
- **Mobile Devices**: Test on actual mobile devices (Android/iOS)

### 2. Test Data Preparation
```javascript
// Sample QR code data for testing
const testQRData = {
  type: 'attendance_checkin',
  timestamp: new Date().toISOString(),
  location: {
    lat: '17.87',
    lng: '120.46'
  },
  valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  admin_id: 'test-admin-id'
}
```

## Testing Procedures

### Phase 1: Basic GPS Functionality

#### Test 1.1: GPS Location Capture
**Objective**: Verify GPS location can be captured accurately

**Steps**:
1. Open mobile interface on real device
2. Navigate to GPS Location component
3. Click "Get Location" button
4. Allow location permissions when prompted
5. Verify location is captured with coordinates

**Expected Results**:
- ✅ Location captured successfully
- ✅ Coordinates displayed (lat, lng)
- ✅ Accuracy information shown
- ✅ Green status indicator displayed

**Test Cases**:
- **Indoor Testing**: Test in building with windows
- **Outdoor Testing**: Test in open area with clear sky
- **Moving Testing**: Test while walking/moving
- **Stationary Testing**: Test while stationary

#### Test 1.2: GPS Accuracy Validation
**Objective**: Verify GPS accuracy meets requirements

**Steps**:
1. Capture location in known location
2. Compare with actual coordinates
3. Check accuracy reading
4. Test multiple times for consistency

**Expected Results**:
- ✅ Accuracy within 10 meters for outdoor testing
- ✅ Consistent readings within reasonable range
- ✅ Accuracy indicator shows reasonable values

### Phase 2: Location Validation Testing

#### Test 2.1: Valid Location (Within Tolerance)
**Objective**: Verify attendance works when within 100m of QR location

**Steps**:
1. Generate QR code at known location (Location A)
2. Move to Location A (within 100m)
3. Scan QR code
4. Verify attendance is recorded

**Expected Results**:
- ✅ Location validation passes
- ✅ Attendance recorded successfully
- ✅ Distance from QR location shown
- ✅ Green status indicator

#### Test 2.2: Invalid Location (Outside Tolerance)
**Objective**: Verify attendance is blocked when outside 100m of QR location

**Steps**:
1. Generate QR code at Location A
2. Move to Location B (more than 100m away)
3. Scan QR code
4. Verify attendance is blocked

**Expected Results**:
- ❌ Location validation fails
- ❌ Attendance blocked with error message
- ❌ Distance shown (over 100m)
- ❌ Red status indicator

#### Test 2.3: Edge Case Testing
**Objective**: Test boundary conditions

**Test Cases**:
- **Exactly 100m**: Test at exactly 100m distance
- **99m Distance**: Test at 99m distance
- **101m Distance**: Test at 101m distance
- **GPS Drift**: Test with GPS signal drift
- **Poor Signal**: Test with weak GPS signal

### Phase 3: Real Device Testing

#### Test 3.1: Android Device Testing
**Devices to Test**:
- Samsung Galaxy (Android 10+)
- Google Pixel (Android 11+)
- OnePlus (Android 12+)
- Xiaomi (Android 11+)

**Browser Testing**:
- Chrome Mobile
- Firefox Mobile
- Samsung Internet
- Edge Mobile

#### Test 3.2: iOS Device Testing
**Devices to Test**:
- iPhone 12/13/14 (iOS 15+)
- iPhone SE (iOS 15+)
- iPad (iOS 15+)

**Browser Testing**:
- Safari Mobile
- Chrome Mobile
- Firefox Mobile

#### Test 3.3: Cross-Platform Testing
**Test Scenarios**:
- **Same Location**: Test with multiple devices at same location
- **Different Locations**: Test with devices at different locations
- **Network Conditions**: Test with different network conditions
- **Battery Levels**: Test with different battery levels

### Phase 4: Error Handling Testing

#### Test 4.1: Permission Denied
**Steps**:
1. Deny location permission when prompted
2. Try to get location
3. Verify error message

**Expected Results**:
- ❌ Clear error message about permission denial
- ❌ Guidance on how to enable permissions

#### Test 4.2: GPS Signal Unavailable
**Steps**:
1. Test in area with no GPS signal (underground, tunnel)
2. Try to get location
3. Verify error handling

**Expected Results**:
- ❌ Clear error message about GPS unavailability
- ❌ Suggestion to move to area with better signal

#### Test 4.3: Timeout Testing
**Steps**:
1. Test in area with poor GPS signal
2. Wait for timeout (15 seconds)
3. Verify timeout error

**Expected Results**:
- ❌ Timeout error message
- ❌ Suggestion to retry or move to better location

### Phase 5: Performance Testing

#### Test 5.1: Location Capture Speed
**Metrics to Measure**:
- Time to get first GPS fix
- Time to get accurate location
- Battery usage during GPS usage
- Memory usage during GPS operations

#### Test 5.2: Accuracy Over Time
**Test Duration**: 30 minutes
**Measurements**: Every 5 minutes
**Expected Results**:
- Consistent accuracy within 10 meters
- No significant drift over time
- Stable readings

## Testing Tools and Utilities

### 1. GPS Testing App
```javascript
// GPS Testing Utility
const GPSTester = {
  async testLocation() {
    try {
      const location = await this.getCurrentLocation()
      console.log('GPS Test Results:', {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      })
      return location
    } catch (error) {
      console.error('GPS Test Error:', error)
      return null
    }
  },
  
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          })
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      )
    })
  }
}
```

### 2. Location Validation Tester
```javascript
// Location Validation Testing
const LocationValidator = {
  testDistanceCalculation(lat1, lng1, lat2, lng2) {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2)
    console.log(`Distance: ${distance}m`)
    return distance <= 100 // 100m tolerance
  },
  
  calculateDistance(lat1, lng1, lat2, lng2) {
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
}
```

## Test Results Documentation

### Test Results Template
```
GPS Functionality Test Results
Date: [DATE]
Tester: [NAME]
Device: [DEVICE MODEL]
Browser: [BROWSER VERSION]
Location: [TEST LOCATION]

Test Cases:
1. GPS Location Capture: [PASS/FAIL]
2. Location Validation: [PASS/FAIL]
3. Distance Calculation: [PASS/FAIL]
4. Error Handling: [PASS/FAIL]
5. Performance: [PASS/FAIL]

Issues Found:
- [ISSUE 1]
- [ISSUE 2]

Recommendations:
- [RECOMMENDATION 1]
- [RECOMMENDATION 2]
```

## Troubleshooting Common Issues

### Issue 1: GPS Not Working
**Symptoms**: Location not captured
**Solutions**:
- Check browser permissions
- Verify HTTPS connection
- Test in area with good GPS signal
- Restart browser/device

### Issue 2: Inaccurate Location
**Symptoms**: Location far from actual position
**Solutions**:
- Wait for GPS to stabilize
- Move to open area
- Check GPS settings
- Restart location services

### Issue 3: Slow Location Capture
**Symptoms**: Long delay in getting location
**Solutions**:
- Check GPS signal strength
- Verify network connection
- Test in different location
- Check device GPS settings

## Success Criteria

### Functional Requirements
- ✅ GPS location captured within 10 seconds
- ✅ Location accuracy within 10 meters
- ✅ Distance calculation accurate to 1 meter
- ✅ Location validation works correctly
- ✅ Error handling provides clear messages

### Performance Requirements
- ✅ Location capture time < 10 seconds
- ✅ Battery usage < 5% per hour
- ✅ Memory usage stable
- ✅ No memory leaks

### User Experience Requirements
- ✅ Clear visual feedback
- ✅ Intuitive error messages
- ✅ Smooth user interaction
- ✅ Responsive interface

## Next Steps After Testing

1. **Document Results**: Record all test results
2. **Fix Issues**: Address any problems found
3. **Optimize Performance**: Improve based on test results
4. **Update Documentation**: Update guides based on findings
5. **Deploy to Production**: Release after successful testing
