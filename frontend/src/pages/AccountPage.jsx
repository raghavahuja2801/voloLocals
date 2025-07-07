import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Save, X, Shield } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useProfileForm } from '../hooks/useProfileForm'

export default function AccountPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  
  const {
    editMode,
    saving,
    error,
    success,
    form,
    handleEdit,
    handleCancel,
    handleChange,
    handleCheckbox,
    handleSave,
  } = useProfileForm(currentUser)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (currentUser === null) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    return null
  }

  const isContractor = currentUser.role === 'contractor'
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
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-6 h-6 mr-2" /> Account
          </h2>
          <div className="mb-4 text-gray-600 text-sm flex items-center">
            <Calendar className="w-4 h-4 mr-1" /> Member since: {memberSince}
            <Shield className="w-4 h-4 ml-4 mr-1" /> Role: {currentUser.role}
          </div>
          {error && <div className="mb-2 text-red-600">{error}</div>}
          {success && <div className="mb-2 text-green-600">{success}</div>}

          <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {/* Display Name */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Email (not editable) */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Address */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {isContractor && (
              <>
                {/* Business Name */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* Service Categories */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Service Categories</label>
                  <input
                    type="text"
                    name="serviceCategories"
                    value={form.serviceCategories}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="e.g. plumbing, electrical"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* Service Areas */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Service Areas</label>
                  <input
                    type="text"
                    name="serviceAreas"
                    value={form.serviceAreas}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="e.g. Downtown, Suburbs"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* License Number */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* Availability Days */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Available Days</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.availabilityDays.includes(day)}
                          onChange={() => handleCheckbox(day)}
                          disabled={!editMode}
                          className="mr-2"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Hours */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">Available Hours</label>
                  <input
                    type="text"
                    name="availabilityHours"
                    value={form.availabilityHours}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="e.g. 9AM-5PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-4 mt-6">
              {!editMode ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ml-auto"
              >
                <Shield className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
