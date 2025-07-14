import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RequestsPage from './pages/RequestsPage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPassword'
import JoiningPage from './pages/JoiningPage'
import ContractorDashboard from './pages/ContractorDashboard'
import MyLeads from './pages/MyLeads'
import AdminDashboard from './pages/AdminDashboard'
import PaymentStatus from './pages/PaymentStatus'
import ProtectedRoute from './components/ProtectedRoute'
import ContractorRoute from './components/ContractorRoute'
import SmartLanding from './components/SmartLanding'
import TermsandCondition from './pages/TermsAndCoditions'
import PrivacyPolicy from './pages/PrivacyPolicy'

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
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contractor" element={<PaymentStatus />} />
        
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
          path="/contractor-dashboard" 
          element={
            <ContractorRoute>
              <ContractorDashboard />
            </ContractorRoute>
          } 
        />
        <Route 
          path="/my-leads" 
          element={
            <ContractorRoute>
              <MyLeads />
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
