import React from "react";

function TrackingPage() {
  const trackingSteps = [
    {
      id: 1,
      status: "Created",
      location: "II/1 Kottayam , Valavoor",
      date: "20 Mar 2025",
      completed: true,
    },
    {
      id: 2,
      status: "On the way",
      location: "Kottayam",
      completed: true,
    },
    {
      id: 3,
      status: "Sent to Kottayam",
      completed: true,
      isSmall: true,
    },
    {
      id: 4,
      status: "Sent to Valavoor",
      completed: true,
      isSmall: true,
    },
    {
      id: 5,
      status: "Received",
      completed: false,
    },
  ];

  return (
    <div className="content-container">
      <div className="tracking-header">
        <button className="back-button">
          <span>←</span>
        </button>
        <button className="menu-button">
          <span>⋮</span>
        </button>
      </div>

      <div className="tracking-card">
        <h3>Parcel Data</h3>

        <div className="tracking-timeline">
          {trackingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`timeline-item ${step.completed ? "completed" : ""} ${
                step.isSmall ? "small" : ""
              }`}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-status">
                  <span>{step.status}</span>
                  {step.location && (
                    <p className="timeline-location">{step.location}</p>
                  )}
                </div>
                {step.date && (
                  <span className="timeline-date">{step.date}</span>
                )}
              </div>
              {index !== trackingSteps.length - 1 && (
                <div className="timeline-line"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="payment-card">
        <h3>Payment Status</h3>
        <div className="payment-details">
          <div className="payment-row">
            <span>Product Price</span>
            <span>Rs 499.00</span>
          </div>
          <div className="payment-row">
            <span>Delivery Price</span>
            <span>Rs 30.00</span>
          </div>
          <div className="payment-row total">
            <span>Total Price</span>
            <span className="orange-text">Rs 529.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackingPage;
