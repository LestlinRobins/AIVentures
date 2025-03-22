import React from 'react';

function CalendarContent() {
  return (
    <div className="content-container">
      <h2>Calendar</h2>
      <div className="content-card">
        <p>Your upcoming shipments and deliveries will be displayed here.</p>
        <div className="calendar-placeholder">
          <p>No scheduled shipments at this time.</p>
        </div>
      </div>
    </div>
  );
}

export default CalendarContent;