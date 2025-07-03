import React, { useState } from 'react'
import { User, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // Optionally handle persistence
      if (remember) {
        // Firebase persistence is set in context; else default
      }
      navigate('/')
    } catch (err) {
      setError('Failed to log in. Please check your credentials.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen min-w-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 my-8 md:my-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Login</h2>
          {error && (
            <div className="mb-4 text-red-600 font-medium">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="h-4 w-4 accent-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-gray-700">
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <User className="w-5 h-5 mr-2" />
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
