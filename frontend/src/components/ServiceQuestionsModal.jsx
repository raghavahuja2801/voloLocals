import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export default function ServiceQuestionsModal({
  serviceType,
  postalCode,
  onClose,
}) {
  const { currentUser, register} = useAuth()

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  // registration flow
  const [isRegisterPhase, setIsRegisterPhase] = useState(false)
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    role: 'user',
  })
  const [regError, setRegError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // fetch the questions when modal mounts
  useEffect(() => {
    setLoading(true)
    fetch(
      `${API_BASE_URL}/api/services/${encodeURIComponent(
        serviceType
      )}/questions`
    )
      .then(res => res.json())
      .then(data => {
        const qs = data.questions || []
        setQuestions(qs)

        // initialize answers for each key - ensure complete isolation
        const init = {}
        qs.forEach(q => {
          if (q.key) {
            init[q.key] = q.type === 'checkbox' ? [] : ''
          }
        })
        setAnswers(init)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [serviceType])


  function handleAnswerChange(key, value, type) {
    setAnswers(prev => {
      // Create a completely new object to avoid any reference issues
      const newAnswers = { ...prev }
      
      if (type === 'checkbox') {
        const currentArray = Array.isArray(newAnswers[key]) ? [...newAnswers[key]] : []
        if (currentArray.includes(value)) {
          newAnswers[key] = currentArray.filter(x => x !== value)
        } else {
          newAnswers[key] = [...currentArray, value]
        }
      } else {
        newAnswers[key] = value
      }
      
      return newAnswers
    })
  }

  async function createLead() {
    const payload = {
      serviceType,
      responses: answers, // Changed from 'answers' to 'responses' to match your middleware
    }
    if (!currentUser) {
        return payload // return early if no user
    }
    const resp = await fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await resp.json()
    if (!json.success) throw new Error('Lead creation failed')
    return json
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      if (currentUser) {
        await createLead()
        onClose()
      } else {
        // go to registration phase
        setIsRegisterPhase(true)
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegisteration() {
    setSubmitting(true)
    setRegError(null)
    try {
      // call your authcontext.register with phone number
      await register(regData.email, regData.password, regData.displayName, regData.phone, regData.role)
      // now currentUser is set, create the lead
      console.log('User registered and logged in:', currentUser)
      setIsRegisterPhase(false)
    } catch (err) {
      console.error(err)
      setRegError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        {!isRegisterPhase ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 capitalize">
              {serviceType} Details
            </h2>
            {loading ? (
              <div className="flex justify-center my-8">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <form className="space-y-6">
                {questions.map((question, index) => {
                  const fieldKey = question.key || question.id || `field_${index}`
                  
                  return (
                    <div key={fieldKey} className="space-y-2">
                      <label htmlFor={fieldKey} className="block font-medium text-gray-700">
                        {question.label}
                      </label>

                      {question.type === 'text' && (
                        <input
                          id={fieldKey}
                          name={fieldKey}
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={answers[fieldKey] || ''}
                          onChange={(e) => handleAnswerChange(fieldKey, e.target.value, 'text')}
                        />
                      )}

                      {question.type === 'select' && (
                        <select
                          id={fieldKey}
                          name={fieldKey}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={answers[fieldKey] || ''}
                          onChange={(e) => handleAnswerChange(fieldKey, e.target.value, 'select')}
                        >
                          <option value="">Choose…</option>
                          {question.options?.map((option, optIndex) => (
                            <option key={`${fieldKey}_opt_${optIndex}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {question.type === 'radio' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <label key={`${fieldKey}_radio_${optIndex}`} className="flex items-center">
                              <input
                                type="radio"
                                name={fieldKey}
                                value={option.value}
                                checked={answers[fieldKey] === option.value}
                                onChange={() => handleAnswerChange(fieldKey, option.value, 'radio')}
                                className="mr-2"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'checkbox' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <label key={`${fieldKey}_checkbox_${optIndex}`} className="flex items-center">
                              <input
                                type="checkbox"
                                name={`${fieldKey}[]`}
                                value={option.value}
                                checked={(answers[fieldKey] || []).includes(option.value)}
                                onChange={() => handleAnswerChange(fieldKey, option.value, 'checkbox')}
                                className="mr-2"
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="pt-4 border-t">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Please wait…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">
              Create an account first
            </h2>
            <form className="space-y-4">
              {regError && (
                <p className="text-red-600">{regError}</p>
              )}
              <input
                type="text"
                placeholder="Full Name"
                value={regData.displayName}
                onChange={e =>
                  setRegData(d => ({ ...d, displayName: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={regData.email}
                onChange={e =>
                  setRegData(d => ({ ...d, email: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={regData.phone}
                onChange={e =>
                  setRegData(d => ({ ...d, phone: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={regData.password}
                onChange={e =>
                  setRegData(d => ({ ...d, password: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                disabled={submitting}
                onClick={handleRegisteration}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition disabled:opacity-50"
              >
                {submitting ? 'Registering…' : 'Register & Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
