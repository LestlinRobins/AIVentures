import { useState } from "react";
import "./AvailableOrders.css";

function AvailableOrders() {
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
                <td>{order.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AvailableOrders;
