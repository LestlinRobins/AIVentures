import React from "react";
import AIInput from "./AIInput";
function CalendarContent() {
  const [showPopup, setShowPopup] = React.useState(false);

  const handleEcoModeChange = () => {
    setShowPopup(true);
  };

  const handleDismiss = () => {
    setShowPopup(false);
  };

  const popupStyles = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#2c2c2e",
    width: "300px",
    padding: "20px",
    borderRadius: "8px",
    color: "#ffffff",
    fontWeight: "light",
    boxShadow: "0px 0px 40px 6px rgba(0, 0, 0, 0.5)",
    zIndex: "1000",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    display: showPopup ? "block" : "none",
  };

  const buttonStyles = {
    backgroundColor: "#ff7f27",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    alignSelf: "center",
  };
  return (
    <div className="content-container">
      <div className="ai-input-container">
        <h2>Hi there, what do you want to do today?</h2>
        <AIInput />
      </div>
      {showPopup && (
        <div className="eco-mode-container">
          <div style={popupStyles}>
            <p>Eco mode enabled</p>
            <p>
              This mode will reduce the amount of energy used by the vehicle.
              Your orders might take a tad bit longer to get picked up, but
              it'll be worth it.
              <br />
              <br />
              Thank you for saving the planet!
            </p>
            <button style={buttonStyles} onClick={handleDismiss}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="button-card">
        <label className="switch">
          <input type="checkbox" onInput={handleEcoModeChange} />
          <span className="slider"></span>
        </label>
        <span className="slider-text">Eco-mode</span>
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
