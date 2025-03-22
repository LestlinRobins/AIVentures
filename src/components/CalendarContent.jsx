import React from "react";
import AIInput from "./AIInput";
function CalendarContent() {
  return (
    <div className="content-container">
      <div className="ai-input-container">
        <h2>Hi there, what do you want to do today?</h2>
        <AIInput />
      </div>
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
