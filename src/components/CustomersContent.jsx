import React from 'react';
import { Users, User, Search } from 'lucide-react';

function CustomersContent() {
  const customers = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", shipments: 12 },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", shipments: 8 },
    { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com", shipments: 5 },
    { id: 4, name: "Alice Brown", email: "alice.brown@example.com", shipments: 3 },
    { id: 5, name: "Charlie Wilson", email: "charlie.wilson@example.com", shipments: 7 }
  ];

  return (
    <div className="content-container">
      <h2>Customers</h2>
      
      <div className="search-container">
        <Search size={18} color="#8e8e93" />
        <input type="text" placeholder="Search Customers" />
      </div>
      
      <div className="content-card">
        {customers.map(customer => (
          <div key={customer.id} className="customer-item">
            <div className="customer-avatar">
              <User size={24} color="#8e8e93" />
            </div>
            <div className="customer-info">
              <div className="customer-name">{customer.name}</div>
              <div className="customer-email">{customer.email}</div>
            </div>
            <div className="customer-shipments">
              <span>{customer.shipments}</span>
              <small>shipments</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomersContent;