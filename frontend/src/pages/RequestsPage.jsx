import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = 'http://localhost:3000'

export default function RequestsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // redirect if not logged in
  useEffect(() => {
    if (currentUser === null) navigate('/login')
  }, [currentUser, navigate])

  // Ref guard so we only fetch once per mount (even under StrictMode)
  const hasFetched = useRef(false)

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingLeads, setDeletingLeads] = useState(new Set())

  useEffect(() => {
    // 1) Wait for user
    // 2) Avoid second fetch
    if (!currentUser || hasFetched.current) return
    hasFetched.current = true

    setLoading(true)
    fetch(`${API_BASE_URL}/api/leads`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(data => {
        if (data.success) setLeads(data.leads)
        else throw new Error('Server error')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [currentUser])

  // Function to handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to close this request? This action cannot be undone.')) {
      return
    }

    setDeletingLeads(prev => new Set([...prev, leadId]))
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete lead')
      }
      
      // Remove the lead from the local state
      setLeads(prev => prev.filter(lead => lead.id !== leadId))
    } catch (err) {
      console.error('Error deleting lead:', err)
      alert('Failed to close the request. Please try again.')
    } finally {
      setDeletingLeads(prev => {
        const newSet = new Set(prev)
        newSet.delete(leadId)
        return newSet
      })
    }
  }


return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Your Requests</h2>

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center py-10">
            <p>Sorry, something went wrong:</p>
            <pre className="mt-2 text-sm">{error}</pre>
          </div>
        )}

        {!loading && !error && leads.length === 0 && (
          <p className="text-gray-600 text-center">You haven’t created any requests yet.</p>
        )}

        {/* Leads grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => {
            // Format timestamp
            const ts = new Date(lead.createdAt._seconds * 1000)
            const createdAt = ts.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })

            // Capitalize serviceType
            const title = lead.serviceType
              .split('-')
              .map(w => w[0].toUpperCase() + w.slice(1))
              .join(' ')

            // Helper function to format field labels
            const formatLabel = (fieldId) => {
              return fieldId
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            }

            // Helper function to format field values
            const formatValue = (fieldId, value) => {
              if (!value) return 'Not specified'
              
              if (fieldId === 'budget') {
                const budgetLabels = {
                  'under-1000': 'Under $1,000',
                  '1000-5000': '$1,000 - $5,000',
                  '5000-10000': '$5,000 - $10,000',
                  '10000-25000': '$10,000 - $25,000',
                  'above-25000': 'Above $25,000'
                }
                return budgetLabels[value] || value
              }
              
              if (fieldId === 'urgent') {
                const urgencyLabels = {
                  'asap': 'ASAP',
                  'this-week': 'This Week',
                  'next-week': 'Next Week',
                  'flexible': 'Flexible'
                }
                return urgencyLabels[value] || value
              }
              
              if (fieldId === 'contact-preference') {
                const contactLabels = {
                  'phone': 'Phone',
                  'email': 'Email',
                  'whatsapp': 'WhatsApp',
                  'any': 'Any method'
                }
                return contactLabels[value] || value
              }
              
              if (fieldId === 'contact-time') {
                const timeLabels = {
                  'morning': 'Morning',
                  'afternoon': 'Afternoon',
                  'evening': 'Evening',
                  'anytime': 'Anytime'
                }
                return timeLabels[value] || value
              }
              
              return value
            }

            // Template fields that should be displayed prominently
            const templateFields = ['budget', 'location', 'pincode', 'urgent', 'contact-preference', 'contact-time']
            
            return (
              <div
                key={lead.id}
                className="bg-white rounded-lg shadow-md p-5 flex flex-col items-start"
              >
                <img
                  src={`/icons/${lead.serviceType}.png`}
                  alt={lead.serviceType}
                  onError={e => { e.currentTarget.src = '/icons/default.png' }}
                  className="h-12 w-12 mb-4"
                />

                <h3 className="text-lg font-semibold mb-2">{title}</h3>

                <p className="text-gray-600 text-sm mb-4">
                  Requested: <time dateTime={ts.toISOString()}>{createdAt}</time>
                </p>

                {/* Display key information */}
                {lead.responses && (
                  <div className="w-full space-y-2 text-sm mb-4">
                    {/* Budget */}
                    {lead.responses.budget && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">{formatValue('budget', lead.responses.budget)}</span>
                      </div>
                    )}
                    
                    {/* Location */}
                    {lead.responses.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{lead.responses.location}</span>
                      </div>
                    )}
                    
                    {/* Urgency */}
                    {lead.responses.urgent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgency:</span>
                        <span className="font-medium">{formatValue('urgent', lead.responses.urgent)}</span>
                      </div>
                    )}
                    
                    {/* Contact preference */}
                    {lead.responses['contact-preference'] && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact via:</span>
                        <span className="font-medium">{formatValue('contact-preference', lead.responses['contact-preference'])}</span>
                      </div>
                    )}
                    
                    {/* Service-specific questions */}
                    {Object.entries(lead.responses || {})
                      .filter(([key]) => !templateFields.includes(key))
                      .map(([questionId, answer]) => (
                        <div key={questionId} className="flex justify-between">
                          <span className="text-gray-600">{formatLabel(questionId)}:</span>
                          <span className="font-medium">{answer || 'Not specified'}</span>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Close Request Button */}
                <button
                  onClick={() => handleDeleteLead(lead.id)}
                  disabled={deletingLeads.has(lead.id)}
                  className="w-full mt-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingLeads.has(lead.id) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Close Request
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}