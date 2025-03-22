import { useState } from "react";
import Home from "./components/Home";
import HomePartner from "./components/Home_partner";
import "./App.css";
import DeliveryRouteOptimizer from "./components/DeliveryRouteOptimizer";

function App() {
  const [isPartnerView, setIsPartnerView] = useState(false);

  return (
    <div className="app-container">
      <div className="view-toggle">
        <span>View Mode:</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isPartnerView}
            onChange={() => setIsPartnerView(!isPartnerView)}
          />
          <span className="slider round"></span>
        </label>
        <span>{isPartnerView ? "Partner" : "Customer"}</span>
      </div>
      {/* <DeliveryRouteOptimizer /> */}
      {isPartnerView ? <HomePartner /> : <Home />}
    </div>
  );
}

export default App;
