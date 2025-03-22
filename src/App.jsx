import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './components/MapComponent'
import DeliveryGeminiChatbot from './components/DeliveryGeminiChatbot'
import DeliveryRouteOptimizer from './components/DeliveryRouteOptimizer'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <MapComponent /> */}
      <DeliveryGeminiChatbot/>
      <DeliveryRouteOptimizer/>
    </>
  )
}

export default App
