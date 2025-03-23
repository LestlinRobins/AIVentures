import { Package } from "lucide-react";

function RecentShipping() {
  const shipments = [
    {
      id: "X435132",
      status: "On the way",
      statusColor: "on-the-way",
      arrivalDate: "27 Mar 2025",
    },
    {
      id: "X432332",
      status: "Completed",
      statusColor: "completed",
      arrivalDate: "21 Mar 2025",
    },
    {
      id: "X677829",
      status: "Completed",
      statusColor: "completed",
      arrivalDate: "27 Mar 2025",
    },
  ];

  return (
    <div className="recent-shipping">
      <h3>Recent Shipping</h3>
      <div className="shipments-list">
        {shipments.map((shipment, index) => (
          <div key={index} className="shipment-item">
            <div className="shipment-info">
              <div className="shipment-avatar">
                <Package size={16} color="#8e8e93" />
              </div>
              <div className="shipment-id">{shipment.id}</div>
              {shipment.status === "On the way" && (
                <div className="shipment-status">
                  <div className="shipment-status-description">
                    We noticed this order was from a hospital, we'll prioritize
                    it for you
                  </div>
                </div>
              )}
            </div>
            <div
              className={`shipment-status ${shipment.statusColor.toLowerCase()}`}
            >
              {shipment.status}
              <span className="arrival-date">{shipment.arrivalDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentShipping;
