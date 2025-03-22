// function RecentShippingPartner() {
//     const shipments = [
//       { id: "ID Number", status: "Completed", customer: "John Doe" },
//       { id: "ID Number", status: "In Progress", customer: "Jane Smith" },
//       { id: "ID Number", status: "Pending", customer: "Bob Johnson" }
//     ];
  
//     return (
//       <div className="recent-shipping partner">
//         <h3>Active Shipments</h3>
//         <div className="shipments-list">
//           {shipments.map((shipment, index) => (
//             <div key={index} className="shipment-item">
//               <div className="shipment-info">
//                 <div className="shipment-avatar"></div>
//                 <div>
//                   <div className="shipment-id">{shipment.id}</div>
//                   <div className="shipment-customer">{shipment.customer}</div>
//                 </div>
//               </div>
//               <div className={`shipment-status ${shipment.status.toLowerCase().replace(' ', '-')}`}>
//                 {shipment.status}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
  
//   export default RecentShippingPartner;


import { Package } from 'lucide-react';

function RecentShippingPartner() {
  const shipments = [
    { id: "ID Number", status: "Completed", customer: "John Doe" },
    { id: "ID Number", status: "In Progress", customer: "Jane Smith" },
    { id: "ID Number", status: "Pending", customer: "Bob Johnson" }
  ];

  return (
    <div className="recent-shipping partner">
      <h3>Active Shipments</h3>
      <div className="shipments-list">
        {shipments.map((shipment, index) => (
          <div key={index} className="shipment-item">
            <div className="shipment-info">
              <div className="shipment-avatar">
                <Package size={16} color="#8e8e93" />
              </div>
              <div>
                <div className="shipment-id">{shipment.id}</div>
                <div className="shipment-customer">{shipment.customer}</div>
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

export default RecentShippingPartner;