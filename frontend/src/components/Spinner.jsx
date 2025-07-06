import React from 'react'

/**
 * A simple Tailwind CSS spinner component.
 *
 * Props:
 * - className?: string - additional classes for sizing or color overrides
 */
export function Spinner({ className = '' }) {
  return (
    <div
      className={`w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export default Spinner