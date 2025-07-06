// src/pages/AccountPage.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

export default function AccountPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (currentUser === null) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    // you could return a spinner here, but redirect above will kick in
    return null
  }

  // format the timestamp coming from backend
  const memberSince = new Date(
    currentUser.createdAt._seconds * 1000
  ).toLocaleDateString()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white">
      <Navbar />

      <main className="flex-grow bg-gray-50 w-full py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Account</h2>

          <div className="space-y-3 text-gray-800">
            <div>
              <span className="font-semibold">Name: </span>
              {currentUser.displayName}
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              {currentUser.email}
            </div>
            <div>
              <span className="font-semibold">Role: </span>
              {currentUser.role}
            </div>
            <div>
              <span className="font-semibold">Member since: </span>
              {memberSince}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
