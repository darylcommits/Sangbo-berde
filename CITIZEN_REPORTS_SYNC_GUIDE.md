# Citizen Reports Sync Guide

## Overview
This guide explains how citizen reports are synchronized between the Citizen Portal and Admin Dashboard, ensuring that reports submitted by citizens appear in the admin interface.

## How It Works

### 1. Citizen Report Submission
When a citizen submits a report through the Citizen Portal:

1. **Primary Attempt**: The system tries to save the report to the Supabase database
2. **Fallback System**: If the database is unavailable, the report is saved to local storage
3. **Event Dispatch**: A custom event `citizenReportSubmitted` is dispatched to notify other components
4. **State Update**: The citizen's local state is updated to show the new report

### 2. Admin Dashboard Integration
The Admin Dashboard (Reports component) has multiple mechanisms to display citizen reports:

1. **Database Query**: Attempts to fetch reports from the `citizen_reports` table
2. **Local Storage Sync**: Checks local storage for additional reports
3. **Real-time Updates**: Listens for storage changes and custom events
4. **Duplicate Prevention**: Filters out duplicate reports when combining sources

### 3. Real-time Synchronization
The system includes several mechanisms for real-time updates:

- **Storage Event Listener**: Listens for `storage` events (cross-tab communication)
- **Custom Event Listener**: Listens for `citizenReportSubmitted` events (same-tab communication)
- **Manual Refresh**: Provides a "Refresh" button for manual updates
- **Auto-refresh**: Automatically refreshes when date range changes

## Key Features

### Date Range Flexibility
- **Extended Range**: Date range now covers the last year to next year to accommodate sample data
- **Debug Information**: Shows current date range and local storage count when no reports are found

### Fallback System
- **Database First**: Always attempts database operations first
- **Local Storage Backup**: Falls back to local storage when database is unavailable
- **Demo Data**: Provides demo reports when no data is available
- **Graceful Degradation**: System continues to work even without database connectivity

### Report Management
- **View Details**: Click to see full report information
- **Assign Reports**: Assign reports to staff members
- **Resolve Reports**: Mark reports as resolved
- **Status Tracking**: Visual status indicators with colors and icons

## Troubleshooting

### If Reports Don't Appear
1. **Check Date Range**: Ensure the date range includes the report creation date
2. **Check Local Storage**: Look for debug information showing local storage count
3. **Use Refresh Button**: Click the "Refresh" button to manually reload data
4. **Check Console**: Look for error messages in the browser console

### Common Issues
- **Date Filtering**: Reports might be filtered out by date range
- **Database Connectivity**: Check if Supabase is properly configured
- **Local Storage**: Ensure reports are being saved to local storage
- **Event Propagation**: Verify custom events are being dispatched

## Technical Implementation

### Event System
```javascript
// Dispatch event when report is submitted
window.dispatchEvent(new CustomEvent('citizenReportSubmitted', { 
  detail: { report: newReport } 
}))

// Listen for events in admin dashboard
window.addEventListener('citizenReportSubmitted', handleStorageChange)
```

### Data Flow
1. Citizen submits report → Local storage + Event dispatch
2. Admin dashboard receives event → Refreshes data
3. Database query attempts → Falls back to local storage
4. Reports displayed with proper status and actions

### Status Management
- **Pending**: New reports awaiting assignment
- **Assigned**: Reports assigned to staff members
- **In Progress**: Reports being worked on
- **Resolved**: Completed reports
- **Closed**: Archived reports

## Testing
To test the synchronization:

1. **Submit a Report**: Use the Citizen Portal to submit a new report
2. **Check Admin Dashboard**: Navigate to Reports section in admin dashboard
3. **Verify Appearance**: The report should appear in the admin interface
4. **Test Actions**: Try assigning and resolving the report
5. **Check Real-time**: Submit another report and verify it appears without refresh

## Future Enhancements
- **WebSocket Integration**: Real-time updates via WebSocket connections
- **Push Notifications**: Browser notifications for new reports
- **Report Analytics**: Detailed analytics on report trends
- **Bulk Operations**: Bulk assignment and resolution of reports
