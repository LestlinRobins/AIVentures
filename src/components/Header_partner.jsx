// function HeaderPartner({ name, date, points }) {
//     return (
//       <div className="header partner">
//         <div className="user-info">
//           <div className="avatar">
//             <div className="avatar-circle partner"></div>
//           </div>
//           <div className="user-details">
//             <div className="user-name">{name}</div>
//             <div className="user-date">{date}</div>
//           </div>
//         </div>
//         <div className="partner-stats-container">
//           <div className="partner-stats">Statistics</div>
//         </div>
//       </div>
//     );
//   }
  
//   export default HeaderPartner;


import { User } from 'lucide-react';

function HeaderPartner({ name, date, points }) {
  return (
    <div className="header partner">
      <div className="user-info">
        <div className="avatar">
          <User size={24} color="#8e8e93" />
        </div>
        <div className="user-details">
          <div className="user-name">{name}</div>
          <div className="user-date">{date}</div>
        </div>
      </div>
      <div className="partner-stats-container">
        <div className="partner-stats">Statistics</div>
      </div>
    </div>
  );
}

export default HeaderPartner;