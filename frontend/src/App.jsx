import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RequestsPage from './pages/RequestsPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPassword'
import JoiningPage from './pages/JoiningPage'
import ContractorDashboard from './pages/ContractorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ContractorRoute from './components/ContractorRoute'
import SmartLanding from './components/SmartLanding'
import TermsandCondition from './pages/TermsandCondition'

function App() {


  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartLanding />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/join" element={<JoiningPage />} />
        <Route path="/terms" element={<TermsandCondition />} />
        
        {/* Protected Routes */}
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute requireRole="user">
              <RequestsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ContractorRoute>
              <ContractorDashboard />
            </ContractorRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* add more routes here */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
