import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {


  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* add more routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
