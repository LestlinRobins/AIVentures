import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MapComponent from './components/MapComponent'
import DeliveryGeminiChatbot from './components/DeliveryGeminiChatbot'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MapComponent />
      <DeliveryGeminiChatbot/>
    </>
  )
}

export default App
