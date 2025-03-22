import React from 'react';

function NotificationsContent() {
  const notifications = [
    { 
      id: 1, 
      message: "Your package #1234 has been delivered", 
      time: "2 hours ago",
      read: false
    },
    { 
      id: 2, 
      message: "New promotion: 15% off your next shipment", 
      time: "1 day ago",
      read: true
    },
    { 
      id: 3, 
      message: "Package #5678 is out for delivery", 
      time: "3 days ago",
      read: true
    }
  ];

  return (
    <div className="content-container">
      <h2>Notifications</h2>
      <div className="content-card">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
          >
            <div className="notification-content">
              <p className="notification-message">{notification.message}</p>
              <p className="notification-time">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsContent;