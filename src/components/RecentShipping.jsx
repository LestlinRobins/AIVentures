// function RecentShipping() {
//     const shipments = [
//       { id: "ID Number", status: "Completed" },
//       { id: "ID Number", status: "Completed" },
//       { id: "ID Number", status: "Completed" }
//     ];
  
//     return (
//       <div className="recent-shipping">
//         <h3>Recent Shipping</h3>
//         <div className="shipments-list">
//           {shipments.map((shipment, index) => (
//             <div key={index} className="shipment-item">
//               <div className="shipment-info">
//                 <div className="shipment-avatar"></div>
//                 <div className="shipment-id">{shipment.id}</div>
//               </div>
//               <div className={`shipment-status ${shipment.status.toLowerCase()}`}>
//                 {shipment.status}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
  
//   export default RecentShipping;

import { Package } from 'lucide-react';

function RecentShipping() {
  const shipments = [
    { id: "ID Number", status: "Completed" },
    { id: "ID Number", status: "Completed" },
    { id: "ID Number", status: "Completed" }
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
            </div>
            <div className={`shipment-status ${shipment.status.toLowerCase()}`}>
              {shipment.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentShipping;