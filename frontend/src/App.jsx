import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RequestsPage from './pages/RequestsPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPassword'
import JoiningPage from './pages/JoiningPage'

function App() {


  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path='/join' element={<JoiningPage />} />
        {/* add more routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
