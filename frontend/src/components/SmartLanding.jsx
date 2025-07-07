import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LandingPage from '../pages/LandingPage'
import Spinner from './Spinner'

export default function SmartLanding() {
  const { currentUser, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <Spinner />
        </div>
      </div>
    )
  }

  // Only redirect contractors to dashboard automatically
  // Regular users can still access the landing page
  if (currentUser && currentUser.role === 'contractor') {
    return <Navigate to="/dashboard" replace />
  }

  // For everyone else (users and guests), show the landing page
  return <LandingPage />
}
