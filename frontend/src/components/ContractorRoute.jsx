import React from 'react'
import ProtectedRoute from './ProtectedRoute'

export default function ContractorRoute({ children }) {
  return (
    <ProtectedRoute requireRole="contractor" redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}
