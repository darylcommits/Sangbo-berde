# Mobile Response Alerts System Guide

## Overview
The Mobile Response Alerts system provides real-time notifications for staff on garbage collection routes, facility load updates, and urgent environmental complaints. This system ensures efficient communication and rapid response to critical situations.

## Key Features

### 1. Real-Time Alert Delivery
- **Instant Notifications**: Alerts are delivered immediately to staff mobile devices
- **Push Notifications**: Browser-based push notifications for urgent alerts
- **Real-time Updates**: Live synchronization across all devices
- **Offline Support**: Alerts are cached locally for offline access

### 2. Alert Categories

#### Route Alerts
- **Route Changes**: Updates to collection routes and schedules
- **Traffic Conditions**: Real-time traffic updates affecting routes
- **Weather Warnings**: Weather conditions impacting collection
- **Route Optimization**: Suggestions for more efficient routes

#### Facility Alerts
- **Capacity Warnings**: Facility load approaching maximum capacity
- **Equipment Issues**: Equipment malfunctions or maintenance needs
- **Processing Updates**: Composting process status and requirements
- **Safety Alerts**: Safety concerns at the facility

#### Environmental Alerts
- **Illegal Dumping**: Reports of illegal waste disposal
- **Environmental Complaints**: Citizen complaints requiring immediate attention
- **Hazardous Materials**: Discovery of hazardous waste requiring special handling
- **Emergency Situations**: Environmental emergencies requiring rapid response

### 3. Priority Levels

#### Urgent (Red)
- **Immediate Action Required**: Environmental emergencies, safety hazards
- **Response Time**: Within 15 minutes
- **Notification**: Push notification + SMS + phone call
- **Examples**: Illegal dumping, hazardous waste, safety incidents

#### High (Orange)
- **Important Updates**: Route changes, facility capacity issues
- **Response Time**: Within 1 hour
- **Notification**: Push notification + SMS
- **Examples**: Route changes, facility capacity warnings

#### Medium (Yellow)
- **Informational**: Weather updates, schedule changes
- **Response Time**: Within 4 hours
- **Notification**: Push notification
- **Examples**: Weather warnings, schedule updates

#### Low (Blue)
- **General Information**: Routine updates, announcements
- **Response Time**: Within 24 hours
- **Notification**: In-app notification
- **Examples**: General announcements, routine updates

## Alert System Components

### 1. Mobile Alert Interface (`AlertSystem.jsx`)

#### Features
- **Alert List**: Display of all alerts with filtering and search
- **Priority Indicators**: Color-coded priority levels
- **Read/Unread Status**: Visual indicators for alert status
- **Alert Details**: Detailed information for each alert
- **Mark as Read**: Individual and bulk read status management

#### Alert Types
```javascript
const alertTypes = {
  route_update: {
    icon: 'TruckIcon',
    color: 'blue',
    description: 'Route changes and updates'
  },
  facility_load: {
    icon: 'ExclamationTriangleIcon',
    color: 'orange',
    description: 'Facility capacity and load alerts'
  },
  environmental_complaint: {
    icon: 'FireIcon',
    color: 'red',
    description: 'Environmental complaints and emergencies'
  },
  weather_alert: {
    icon: 'ShieldExclamationIcon',
    color: 'yellow',
    description: 'Weather warnings and conditions'
  }
}
```

#### Filtering Options
- **All Alerts**: Display all alerts regardless of category
- **Unread Only**: Show only unread alerts
- **By Category**: Filter by route, facility, environmental, urgent
- **By Priority**: Filter by urgency level
- **Search**: Text search across alert titles and messages

### 2. Admin Alert Management (`AlertManagement.jsx`)

#### Features
- **Create Alerts**: Form-based alert creation with targeting
- **Alert Templates**: Pre-defined alert templates for common scenarios
- **Staff Targeting**: Select specific staff members or groups
- **Alert History**: View and manage all sent alerts
- **Analytics**: Alert delivery and response statistics

#### Alert Creation Form
```javascript
const alertForm = {
  type: 'route_update', // Alert type
  title: 'Route Change Alert', // Alert title
  message: 'Your collection route has been updated...', // Alert message
  priority: 'high', // Priority level
  category: 'route', // Alert category
  target_users: ['user1', 'user2'], // Target staff IDs
  data: { // Additional data
    route_id: 'R001',
    new_route: 'Barangay A → Barangay B',
    estimated_time: '2 hours'
  }
}
```

#### Staff Targeting Options
- **Individual Staff**: Target specific staff members
- **Role-based**: Target all staff with specific roles
- **Location-based**: Target staff in specific areas
- **Group-based**: Target predefined staff groups

### 3. Real-Time Communication

#### WebSocket Integration
```javascript
// Real-time alert subscription
const channel = supabase
  .channel('alerts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'notifications' },
    (payload) => {
      // Handle new alert
      setAlerts(prev => [payload.new, ...prev])
      setUnreadCount(prev => prev + 1)
    }
  )
  .subscribe()
```

#### Push Notifications
- **Browser Notifications**: Native browser push notifications
- **Service Worker**: Background notification handling
- **Permission Management**: Request and manage notification permissions
- **Fallback Support**: SMS and email fallbacks for critical alerts

## Alert Data Structure

### Database Schema
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Alert Object Structure
```javascript
const alert = {
  id: 'alert-123',
  user_id: 'user-456',
  type: 'route_update',
  title: 'Route Change Alert',
  message: 'Your collection route has been updated...',
  priority: 'high',
  category: 'route',
  data: {
    route_id: 'R001',
    new_route: 'Barangay A → Barangay B → Barangay C',
    estimated_time: '2 hours',
    coordinates: {
      start: { lat: 17.87, lng: 120.46 },
      end: { lat: 17.88, lng: 120.47 }
    }
  },
  is_read: false,
  created_at: '2024-01-15T10:30:00Z'
}
```

## Alert Scenarios

### 1. Route Change Alert
```javascript
const routeAlert = {
  type: 'route_update',
  title: 'Route Change Alert',
  message: 'Your collection route has been updated. Please check the new route details.',
  priority: 'high',
  category: 'route',
  data: {
    route_id: 'R001',
    old_route: 'Barangay A → Barangay C → Barangay B',
    new_route: 'Barangay A → Barangay B → Barangay C',
    reason: 'Traffic congestion on main road',
    estimated_time: '2 hours',
    coordinates: {
      start: { lat: 17.87, lng: 120.46 },
      waypoints: [
        { lat: 17.88, lng: 120.47 },
        { lat: 17.89, lng: 120.48 }
      ],
      end: { lat: 17.90, lng: 120.49 }
    }
  }
}
```

### 2. Facility Capacity Alert
```javascript
const facilityAlert = {
  type: 'facility_load',
  title: 'Facility Capacity Alert',
  message: 'Composting facility is at 85% capacity. Please coordinate with facility staff.',
  priority: 'urgent',
  category: 'facility',
  data: {
    facility_id: 'F001',
    facility_name: 'Main Composting Facility',
    current_load: 85,
    max_capacity: 100,
    action_required: 'Coordinate with facility staff',
    estimated_full_time: '2 hours',
    alternative_facilities: [
      { id: 'F002', name: 'Secondary Facility', capacity: 60 }
    ]
  }
}
```

### 3. Environmental Complaint Alert
```javascript
const environmentalAlert = {
  type: 'environmental_complaint',
  title: 'Urgent Environmental Complaint',
  message: 'Illegal dumping reported in your area. Please investigate immediately.',
  priority: 'urgent',
  category: 'environmental',
  data: {
    complaint_id: 'C001',
    location: '123 Main Street, Barangay A',
    coordinates: { lat: 17.87, lng: 120.46 },
    reporter: 'Citizen Report',
    urgency: 'high',
    description: 'Large amount of construction waste dumped illegally',
    photos: ['photo1.jpg', 'photo2.jpg'],
    reported_at: '2024-01-15T09:15:00Z',
    response_deadline: '2024-01-15T10:15:00Z'
  }
}
```

### 4. Weather Alert
```javascript
const weatherAlert = {
  type: 'weather_alert',
  title: 'Weather Warning',
  message: 'Heavy rain expected. Adjust collection schedule accordingly.',
  priority: 'medium',
  category: 'route',
  data: {
    weather_condition: 'Heavy Rain',
    severity: 'moderate',
    expected_duration: '3 hours',
    impact: 'Collection may be delayed',
    recommendation: 'Use covered vehicles',
    affected_routes: ['R001', 'R002'],
    alternative_schedule: 'Start 2 hours earlier'
  }
}
```

## User Interface Features

### 1. Mobile Alert Interface

#### Alert List
- **Priority Indicators**: Color-coded priority levels
- **Read/Unread Status**: Visual indicators for alert status
- **Time Stamps**: When alerts were received
- **Category Icons**: Visual indicators for alert types
- **Quick Actions**: Mark as read, view details, respond

#### Alert Details
- **Full Message**: Complete alert information
- **Additional Data**: Structured data for specific alert types
- **Action Buttons**: Respond, acknowledge, escalate
- **Related Information**: Links to relevant documents or maps

#### Filtering and Search
- **Category Filters**: Filter by alert type
- **Priority Filters**: Filter by urgency level
- **Status Filters**: Show read/unread alerts
- **Text Search**: Search across alert content
- **Date Range**: Filter by time period

### 2. Admin Management Interface

#### Alert Creation
- **Form-based Creation**: Easy alert creation with validation
- **Template Selection**: Pre-defined templates for common alerts
- **Staff Targeting**: Select specific staff or groups
- **Preview**: Preview alert before sending
- **Scheduling**: Schedule alerts for future delivery

#### Alert Management
- **Alert History**: View all sent alerts
- **Delivery Status**: Track alert delivery and read status
- **Response Tracking**: Monitor staff responses
- **Analytics**: Alert effectiveness and engagement metrics

## Integration Points

### 1. GPS Integration
- **Location-based Alerts**: Alerts based on staff location
- **Route-specific Notifications**: Alerts for specific routes
- **Proximity Alerts**: Alerts when approaching specific areas
- **Location Validation**: Ensure staff are in correct locations

### 2. Task Management Integration
- **Task-related Alerts**: Alerts for task assignments and updates
- **Completion Notifications**: Alerts when tasks are completed
- **Deadline Reminders**: Alerts for approaching deadlines
- **Status Updates**: Real-time task status notifications

### 3. Citizen Portal Integration
- **Complaint Alerts**: Alerts for citizen complaints
- **Report Notifications**: Alerts for new citizen reports
- **Response Tracking**: Track responses to citizen reports
- **Feedback Notifications**: Alerts for citizen feedback

## Best Practices

### 1. Alert Creation
- **Clear Titles**: Use descriptive and actionable titles
- **Concise Messages**: Keep messages clear and to the point
- **Appropriate Priority**: Use correct priority levels
- **Targeted Delivery**: Send alerts only to relevant staff
- **Timely Delivery**: Send alerts at appropriate times

### 2. Alert Management
- **Regular Cleanup**: Archive old alerts regularly
- **Response Tracking**: Monitor alert responses
- **Feedback Collection**: Gather feedback on alert effectiveness
- **Continuous Improvement**: Update alert system based on feedback

### 3. Staff Training
- **Alert Recognition**: Train staff to recognize different alert types
- **Response Procedures**: Establish clear response procedures
- **Escalation Paths**: Define escalation procedures for urgent alerts
- **Regular Updates**: Keep staff informed of alert system changes

## Troubleshooting

### 1. Common Issues
- **Alert Not Received**: Check notification permissions and network connection
- **Delayed Delivery**: Verify server status and network connectivity
- **Incorrect Targeting**: Verify staff selection and role assignments
- **Alert Format Issues**: Check alert data structure and validation

### 2. Performance Optimization
- **Alert Caching**: Cache alerts locally for offline access
- **Batch Processing**: Process multiple alerts efficiently
- **Database Optimization**: Optimize database queries for alert retrieval
- **Network Optimization**: Minimize data transfer for mobile devices

### 3. Monitoring and Analytics
- **Delivery Rates**: Monitor alert delivery success rates
- **Response Times**: Track staff response times to alerts
- **Engagement Metrics**: Measure alert effectiveness and engagement
- **System Performance**: Monitor alert system performance

## Future Enhancements

### 1. Advanced Features
- **AI-powered Alerts**: Use AI to generate contextual alerts
- **Predictive Alerts**: Predict and prevent issues before they occur
- **Voice Alerts**: Voice-based alert delivery and response
- **Video Alerts**: Video-based alert content and instructions

### 2. Integration Improvements
- **IoT Integration**: Connect with IoT sensors for automated alerts
- **External Systems**: Integrate with external weather and traffic systems
- **Social Media**: Monitor social media for relevant alerts
- **Emergency Services**: Integrate with emergency response systems

### 3. User Experience
- **Personalization**: Customize alert preferences per staff member
- **Smart Filtering**: AI-powered alert filtering and prioritization
- **Offline Support**: Enhanced offline alert access and response
- **Multi-language**: Support for multiple languages

## Conclusion

The Mobile Response Alerts system provides a comprehensive solution for real-time communication with staff, ensuring efficient response to route changes, facility updates, and environmental emergencies. The system's flexible architecture allows for easy customization and integration with existing systems, while its user-friendly interface ensures high adoption and effectiveness.

The alert system is designed to scale with the SANGBO BERDE composting facility operations, providing reliable communication channels that support the facility's mission of efficient waste management and environmental protection.
