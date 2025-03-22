// function PackageSearch() {
//     return (
//       <div className="package-search">
//         <div className="search-container">
//           <span className="search-icon">🔍</span>
//           <input type="text" placeholder="Track Your Package" />
//         </div>
//       </div>
//     );
//   }
  
//   export default PackageSearch;


import { Search } from 'lucide-react';

function PackageSearch() {
  return (
    <div className="package-search">
      <div className="search-container">
        <Search size={18} color="#8e8e93" />
        <input type="text" placeholder="Track Your Package" />
      </div>
    </div>
  );
}

export default PackageSearch;