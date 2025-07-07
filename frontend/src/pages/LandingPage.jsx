// // src/pages/LandingPage.jsx
// import React, { useState } from 'react'
// import Navbar from '../components/Navbar'
// import Footer from '../components/Footer'

// export default function LandingPage() {
//   return (
//      <div className="flex flex-col flex-1 min-h-screen w-screen bg-white overflow-x-hidden">
//       <Navbar />
//       <main className="flex-grow flex flex-col items-start justify-center bg-gray-50 w-full">
// +        <div className="w-full max-w-4xl mx-auto text-center md:text-left px-4 py-24 md:py-48">
//         <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to VoloLocals</h1>
//         <p className="text-xl text-gray-600 mb-8">Find and hire local professionals in minutes</p>
//         <a
//           href="/login"
//           className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
//         >
//           Get Started
//         </a>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }


// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceQuestionsModal from '../components/ServiceQuestionsModal'

const API_BASE_URL =   'http://192.168.1.69:3000'

export default function LandingPage() {
  const [serviceQuery, setServiceQuery] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!serviceQuery.trim()) {
      setSuggestions([])
      return
    }
    const q = serviceQuery.trim().toLowerCase()
    const timer = setTimeout(() => {
      console.log('Fetching from:', `${API_BASE_URL}/api/services?search=${encodeURIComponent(q)}`)
      fetch(`${API_BASE_URL}/api/services?search=${encodeURIComponent(q)}`)
        .then(res => {
          console.log('Response status:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('Response data:', data)
          const raw = data.services || []
          const sorted = raw
            .map(s => ({ s, idx: s.toLowerCase().indexOf(q) }))
            .sort((a, b) => {
              const aScore = a.idx === -1 ? Infinity : a.idx
              const bScore = b.idx === -1 ? Infinity : b.idx
              return aScore - bScore
            })
            .map(o => o.s)
          setSuggestions(sorted)
        })
        .catch(err => {
          console.error('Fetch error:', err)
        })
    }, 300)
    return () => clearTimeout(timer)
  }, [serviceQuery])

  const recommended = suggestions[0] || null

  // keep dropdown open when clicking on it
  const handleBlur = e => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget)
    ) {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow w-full py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Find the perfect professional for you
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Get free quotes within minutes
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
            {/* Service Input with dropdown */}
            <div
              className="relative flex-1"
              ref={containerRef}
              onBlur={handleBlur}
            >
              <input
                type="text"
                className="w-full border border-gray-300 rounded-l-md sm:rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What service are you looking for?"
                value={serviceQuery}
                onChange={e => {
                  setServiceQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => serviceQuery && setShowSuggestions(true)}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                  {/* Recommended */}
                  {recommended && (
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                      onMouseDown={() => {
                        setServiceQuery(recommended)
                        setShowSuggestions(false)
                      }}
                    >
                      Recommended: {recommended}
                    </button>
                  )}
                  {/* All other suggestions */}
                  <ul className="max-h-60 overflow-auto">
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                          onMouseDown={() => {
                            setServiceQuery(s)
                            setShowSuggestions(false)
                          }}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Postcode */}
            <input
              type="text"
              className="w-full sm:w-40 border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Postcode"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
            />

            {/* Search Button */}
            <button
              type="button"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
              onClick={() => {
                /* your search handler */
                setShowQuestions(true)
                
              }}
            >
              Search
            </button>
          </div>
        </div>
      </main>
      {showQuestions && (
        <ServiceQuestionsModal
          serviceType={serviceQuery}
          postalCode={postalCode}
          onClose={() => setShowQuestions(false)}
        />
      )}

      <Footer />
    </div>
  )
}
