import React, { useState } from 'react';
import { Package, Filter } from 'lucide-react';

function ShipmentsContent() {
  const [filterActive, setFilterActive] = useState(false);
  
  const shipments = [
    { id: "SHP-1234", status: "In Transit", customer: "John Doe", date: "Mar 25, 2023" },
    { id: "SHP-5678", status: "Delivered", customer: "Jane Smith", date: "Mar 24, 2023" },
    { id: "SHP-9012", status: "Processing", customer: "Bob Johnson", date: "Mar 24, 2023" },
    { id: "SHP-3456", status: "Cancelled", customer: "Alice Brown", date: "Mar 23, 2023" },
    { id: "SHP-7890", status: "Delivered", customer: "Charlie Wilson", date: "Mar 22, 2023" }
  ];

  return (
    <div className="content-container">
      <div className="content-header">
        <h2>All Shipments</h2>
        <button 
          className={`filter-button ${filterActive ? 'active' : ''}`}
          onClick={() => setFilterActive(!filterActive)}
        >
          <Filter size={20} />
        </button>
      </div>
      
      {filterActive && (
        <div className="filter-options">
          <div className="filter-option">
            <input type="checkbox" id="inTransit" />
            <label htmlFor="inTransit">In Transit</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="delivered" />
            <label htmlFor="delivered">Delivered</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="processing" />
            <label htmlFor="processing">Processing</label>
          </div>
          <div className="filter-option">
            <input type="checkbox" id="cancelled" />
            <label htmlFor="cancelled">Cancelled</label>
          </div>
        </div>
      )}
      
      <div className="content-card">
        {shipments.map((shipment, index) => (
          <div key={index} className="shipment-item detailed">
            <div className="shipment-info">
              <div className="shipment-avatar">
                <Package size={16} color="#8e8e93" />
              </div>
              <div>
                <div className="shipment-id">{shipment.id}</div>
                <div className="shipment-customer">{shipment.customer}</div>
                <div className="shipment-date">{shipment.date}</div>
              </div>
            </div>
            <div className={`shipment-status ${shipment.status.toLowerCase().replace(' ', '-')}`}>
              {shipment.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShipmentsContent;