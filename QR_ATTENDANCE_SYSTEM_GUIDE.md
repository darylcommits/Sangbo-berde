# QR Code Attendance System Guide

## Overview
This guide explains the QR code-based attendance system where admins generate QR codes and staff scan them for attendance tracking.

## System Components

### 1. Admin Dashboard - Attendance Management
**Location**: Admin Dashboard → Attendance Management

**Features**:
- **Generate QR Code**: Creates time-limited QR codes for attendance
- **View Attendance Records**: See all staff attendance with timestamps and locations
- **Manage Attendance**: Mark late, check out, update status
- **Real-time Updates**: Attendance records update in real-time
- **Filter Options**: Filter by date and status

**QR Code Generation**:
- QR codes are valid for 30 minutes
- Include location data (latitude/longitude)
- Contain timestamp and admin ID
- Can be downloaded as PNG image

### 2. Mobile Interface - QR Scanner
**Location**: Mobile Interface → QR Scanner

**Features**:
- **Camera Access**: Uses device camera to scan QR codes
- **QR Validation**: Validates QR code format and expiration
- **Attendance Recording**: Automatically records check-in with location
- **Error Handling**: Handles invalid/expired QR codes
- **Manual Input**: Fallback option for manual QR code entry

## How It Works

### Step 1: Admin Generates QR Code
1. Admin navigates to **Attendance Management** in dashboard
2. Clicks **"Generate QR Code"** button
3. System creates QR code with:
   - Current timestamp
   - Location coordinates
   - 30-minute expiration
   - Admin ID
4. QR code is displayed in modal with download option

### Step 2: Staff Scans QR Code
1. Staff opens mobile interface
2. Taps **"QR Scanner"** button
3. Camera opens with scanning interface
4. Staff points camera at admin's QR code
5. System validates QR code and records attendance

### Step 3: Attendance Recording
1. **Database First**: Attempts to save to Supabase `attendance` table
2. **Local Storage Fallback**: If database unavailable, saves to local storage
3. **Real-time Sync**: Notifies admin dashboard of new attendance
4. **Status Update**: Marks staff as present with timestamp and location

## Technical Implementation

### QR Code Data Structure
```json
{
  "type": "attendance_checkin",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "location": {
    "lat": "17.87",
    "lng": "120.46"
  },
  "valid_until": "2025-01-27T11:00:00.000Z",
  "admin_id": "current-admin-id"
}
```

### Attendance Record Structure
```json
{
  "id": "unique-id",
  "staff_id": "staff-member-id",
  "check_in": "2025-01-27T10:30:00.000Z",
  "check_out": null,
  "location_lat": "17.87",
  "location_lng": "120.46",
  "status": "present",
  "notes": "QR code check-in",
  "created_at": "2025-01-27T10:30:00.000Z"
}
```

### Real-time Synchronization
- **Custom Events**: `attendanceUpdated` event for cross-component communication
- **Storage Events**: Local storage changes trigger updates
- **Database Sync**: Automatic fallback to local storage when database unavailable

## Features

### Admin Features
- ✅ **QR Code Generation**: Create time-limited attendance QR codes
- ✅ **Attendance Monitoring**: View all staff attendance records
- ✅ **Status Management**: Mark late, check out, update attendance status
- ✅ **Location Tracking**: See GPS coordinates of check-ins
- ✅ **Real-time Updates**: Live updates when staff check in
- ✅ **Export Options**: Download QR codes as images
- ✅ **Filtering**: Filter by date and status

### Staff Features
- ✅ **QR Code Scanning**: Use camera to scan attendance QR codes
- ✅ **Location Recording**: Automatic GPS location capture
- ✅ **Validation**: QR code format and expiration validation
- ✅ **Error Handling**: Clear error messages for invalid QR codes
- ✅ **Manual Input**: Fallback option for manual QR code entry
- ✅ **Offline Support**: Works without internet connection

### System Features
- ✅ **Database Integration**: Supabase database for attendance records
- ✅ **Local Storage Fallback**: Works offline with local storage
- ✅ **Real-time Sync**: Cross-component communication
- ✅ **Security**: Time-limited QR codes prevent replay attacks
- ✅ **Location Verification**: GPS coordinates for attendance verification

## Usage Instructions

### For Admins
1. **Generate QR Code**:
   - Go to Attendance Management
   - Click "Generate QR Code"
   - Display QR code to staff
   - Download QR code if needed

2. **Monitor Attendance**:
   - View attendance records in real-time
   - Filter by date and status
   - Update attendance status as needed
   - Check staff locations

### For Staff
1. **Check In**:
   - Open mobile interface
   - Tap "QR Scanner"
   - Point camera at admin's QR code
   - Wait for confirmation

2. **Troubleshooting**:
   - If QR code doesn't scan, try manual input
   - Check camera permissions
   - Ensure QR code is not expired

## Troubleshooting

### Common Issues
1. **QR Code Not Scanning**:
   - Check camera permissions
   - Ensure good lighting
   - Try manual input option

2. **QR Code Expired**:
   - Ask admin to generate new QR code
   - QR codes are valid for 30 minutes only

3. **Attendance Not Recorded**:
   - Check internet connection
   - Attendance is saved locally if database unavailable
   - Contact admin if issues persist

4. **Camera Not Working**:
   - Check browser permissions
   - Try refreshing the page
   - Use manual input as fallback

### Error Messages
- **"QR code has expired"**: Generate new QR code
- **"Invalid QR code"**: Scan correct attendance QR code
- **"Camera access denied"**: Allow camera permissions
- **"Attendance recorded locally"**: Database unavailable, but attendance saved

## Security Features
- **Time-limited QR codes**: 30-minute expiration prevents replay attacks
- **Location verification**: GPS coordinates ensure physical presence
- **Admin validation**: Only admin-generated QR codes are accepted
- **Unique timestamps**: Prevents duplicate attendance records

## Future Enhancements
- **Biometric verification**: Fingerprint/face recognition
- **Geofencing**: Location-based attendance validation
- **Push notifications**: Real-time attendance alerts
- **Analytics dashboard**: Attendance trends and reports
- **Bulk operations**: Mass attendance management
