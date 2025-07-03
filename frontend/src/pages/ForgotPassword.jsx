import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Check your inbox for further instructions.')
      // Optionally redirect after a delay
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to reset password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Forgot Password
          </h2>
          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
          {message && <div className="mb-4 text-green-600 font-medium">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Mail className="w-5 h-5 mr-2" />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
