import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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

                {/* you can add other fields if you like */}
                {/* <p className="text-gray-800">{lead.company}</p> */}
              </div>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}