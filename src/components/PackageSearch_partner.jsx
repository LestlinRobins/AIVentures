// function PackageSearchPartner() {
//     return (
//       <div className="package-search partner">
//         <div className="search-container">
//           <span className="search-icon">🔍</span>
//           <input type="text" placeholder="Search Shipments" />
//         </div>
//       </div>
//     );
//   }
  
//   export default PackageSearchPartner;

import { Search } from 'lucide-react';

function PackageSearchPartner() {
  return (
    <div className="package-search partner">
      <div className="search-container">
        <Search size={18} color="#8e8e93" />
        <input type="text" placeholder="Search Shipments" />
      </div>
    </div>
  );
}

export default PackageSearchPartner;