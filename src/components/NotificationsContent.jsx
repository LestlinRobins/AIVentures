import React from "react";

function NotificationsContent() {
  const notifications = [
    {
      id: 1,
      message: "Your order is on the move! Expected to arrive by 3:45 PM",
      time: "Just now",
      icon: "📦",
    },
    {
      id: 2,
      message: "Out for delivery! Your package will arrive within 30 minutes.",
      time: "15 min ago",
      icon: "🚚",
    },
    {
      id: 3,
      message: "Slight delay due to traffic, but we're on it! ETA: 5:15 PM",
      time: "30 min ago",
      icon: "🕒",
    },
    {
      id: 4,
      message:
        "Your package has been delivered! Check outside or at your doorstep.",
      time: "1 hour ago",
      icon: "✅",
    },
    {
      id: 5,
      message:
        "New optimized route available! Save 10 minutes on your next stop.",
      time: "2 hours ago",
      icon: "🗺️",
    },
  ];

  return (
    <div className="content-container">
      <h2>Notification</h2>
      <div>
        {notifications.map((notification) => (
          <div key={notification.id} className="notification-item">
            <div className="notification-icon">{notification.icon}</div>
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
