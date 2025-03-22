// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'
// // import MapComponent from './components/MapComponent'
// // import DeliveryGeminiChatbot from './components/DeliveryGeminiChatbot'
// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <MapComponent />
// //       <DeliveryGeminiChatbot/>
// //     </>
// //   )
// // }

// // export default App


// import { useState } from 'react';
// import Home from './components/Home';
// import HomePartner from './components/Home_partner';
// import './App.css';

// function App() {
//   const [isPartnerView, setIsPartnerView] = useState(false);

//   return (
//     <div className="app-container">
//       <div className="view-toggle">
//         <span>View Mode:</span>
//         <label className="switch">
//           <input 
//             type="checkbox" 
//             checked={isPartnerView} 
//             onChange={() => setIsPartnerView(!isPartnerView)}
//           />
//           <span className="slider round"></span>
//         </label>
//         <span>{isPartnerView ? 'Partner' : 'Customer'}</span>
//       </div>
      
//       {isPartnerView ? <HomePartner /> : <Home />}
//     </div>
//   );
// }

// export default App;



import { useState } from 'react';
import Home from './components/Home';
import HomePartner from './components/Home_partner';
import './App.css';

function App() {
  const [isPartnerView, setIsPartnerView] = useState(false);

  return (
    <div className="app-container">
      <div className="view-toggle">
        <span>View Mode:</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isPartnerView} 
            onChange={() => setIsPartnerView(!isPartnerView)}
          />
          <span className="slider round"></span>
        </label>
        <span>{isPartnerView ? 'Partner' : 'Customer'}</span>
      </div>
      
      {isPartnerView ? <HomePartner /> : <Home />}
    </div>
  );
}

export default App;