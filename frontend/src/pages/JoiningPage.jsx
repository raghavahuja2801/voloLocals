import React, { useState } from 'react'
import { User, Mail, Lock, Briefcase, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'

export default function JoiningPage() {
  const { registerProfessional } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [serviceCategories, setServiceCategories] = useState([])
  const [serviceAreas, setServiceAreas] = useState([])
  const [licenseNumber, setLicenseNumber] = useState('')
  const [availability, setAvailability] = useState({ days: [], hours: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await registerProfessional({
        email,
        password,
        displayName,
        phone,
        businessName,
        serviceCategories,
        serviceAreas,
        licenseNumber,
        availability,
      })
      navigate('/') // Redirect to smart landing which will route to dashboard for contractors
    } catch (err) {
      console.error(err)
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Join as a Contractor</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Business Name */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Briefcase className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Phone Number */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Service Categories */}
            <div className="relative">
              <input
                type="text"
                placeholder="Service Categories (e.g., plumbing, electrical, cleaning)"
                value={serviceCategories.join(', ')}
                onChange={(e) => setServiceCategories(e.target.value.split(', ').filter(cat => cat.trim()))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Service Areas */}
            <div className="relative">
              <input
                type="text"
                placeholder="Service Areas (e.g., Downtown, Suburbs, City Center)"
                value={serviceAreas.join(', ')}
                onChange={(e) => setServiceAreas(e.target.value.split(', ').filter(area => area.trim()))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* License Number */}
            <div className="relative">
              <input
                type="text"
                placeholder="License Number (optional)"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Availability Days */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={availability.days.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAvailability(prev => ({ ...prev, days: [...prev.days, day] }))
                        } else {
                          setAvailability(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }))
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Hours */}
            <div className="relative">
              <input
                type="text"
                placeholder="Available Hours (e.g., 9AM-5PM)"
                value={availability.hours}
                onChange={(e) => setAvailability(prev => ({ ...prev, hours: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

          

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}