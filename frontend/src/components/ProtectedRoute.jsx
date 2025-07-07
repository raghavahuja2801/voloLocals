import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './Spinner'

export default function ProtectedRoute({ 
  children, 
  requireRole = null, 
  redirectTo = '/login' 
}) {
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

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />
  }

  // If specific role is required, check if user has that role
  if (requireRole && currentUser.role !== requireRole) {
    // Redirect based on user role
    if (currentUser.role === 'contractor') {
      return <Navigate to="/dashboard" replace />
    } else {
      return <Navigate to="/requests" replace />
    }
  }

  // User is authenticated and has required role (if any)
  return children
}
