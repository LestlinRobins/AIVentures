import { useState } from "react";
import "./AvailableOrders.css";
import DeliveryRouteOptimizer from "./DeliveryRouteOptimizer";

function AvailableOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const orders = [
    {
      id: "Xtwr321",
      customer: "Martha Stewart",
      status: "Pending",
      action: "Accept",
      startlocation: "New York",
      endlocation: "Los Angeles",
      numberOfPackages: 2,
      weightPerPackage: 10,
      volumePerPackage: 1,
      priorityLevel: "Standard",
    },
    {
      id: "Xtwr322",
      customer: "Alicia Keys",
      status: "Pending",
      action: "Accept",
      startlocation: "New York",
      endlocation: "Los Angeles",
      numberOfPackages: 2,
      weightPerPackage: 10,
      volumePerPackage: 1,
      priorityLevel: "Standard",
    },
    {
      id: "Xtwr323",
      customer: "Sia LaBeouf",
      status: "Pending",
      action: "Accept",
      startlocation: "New York",
      endlocation: "Los Angeles",
      numberOfPackages: 2,
      weightPerPackage: 10,
      volumePerPackage: 1,
      priorityLevel: "Standard",
    },
  ];

  const handleAccept = (order) => {
    setSelectedOrder(order);
    setShowOptimizer(true);
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setShowOptimizer(false);
  };

  if (showOptimizer && selectedOrder) {
    return (
      <div className="delivery-optimizer-container">
        <button className="back-button" onClick={handleBack}>
          ← Back to Orders
        </button>
        <DeliveryRouteOptimizer
          startLocation={selectedOrder.startlocation}
          endLocation={selectedOrder.endlocation}
          numberOfPackages={selectedOrder.numberOfPackages}
          weightPerPackage={selectedOrder.weightPerPackage}
          volumePerPackage={selectedOrder.volumePerPackage}
          priorityLevel={selectedOrder.priorityLevel}
        />
      </div>
    );
  }

  return (
    <div className="available-orders-container">
      <h2>Available Orders</h2>
      <div className="available-orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  {order.id}
                  <div className="location-tags">
                    <span className="location-tag-start">
                      {order.startlocation}
                    </span>
                    <span className="location-arrow">→</span>
                    <span className="location-tag-end">
                      {order.endlocation}
                    </span>
                  </div>
                </td>
                <td>{order.customer}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    className="accept-button"
                    onClick={() => handleAccept(order)}
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AvailableOrders;
