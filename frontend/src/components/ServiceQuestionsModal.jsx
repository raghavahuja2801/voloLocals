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

        // initialize answers for each key
        const init = {}
        qs.forEach(q => {
          init[q.key] = q.type === 'checkbox' ? [] : ''
        })
        setAnswers(init)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [serviceType])


  function handleAnswerChange(key, value, type) {
    setAnswers(prev => {
      if (type === 'checkbox') {
        const arr = prev[key] || []
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter(x => x !== value)
            : [...arr, value],
        }
      }
      return { ...prev, [key]: value }
    })
  }

  async function createLead() {
    const payload = {
      serviceType,
      postalCode,
      answers,
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
                {questions.map((q, i) => (
                  <div key={i}>
                    <label className="block font-medium mb-1">{q.label}</label>

                    {q.type === 'text' && (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={answers[q.key]}
                        onChange={e =>
                          handleAnswerChange(q.key, e.target.value, q.type)
                        }
                      />
                    )}

                    {q.type === 'select' && (
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={answers[q.key]}
                        onChange={e =>
                          handleAnswerChange(q.key, e.target.value, q.type)
                        }
                      >
                        <option value="">Choose…</option>
                        {q.options.map(o => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {q.type === 'radio' && (
                      <div className="space-x-4">
                        {q.options.map(o => (
                          <label
                            key={o.value}
                            className="inline-flex items-center"
                          >
                            <input
                              type="radio"
                              name={q.key}
                              value={o.value}
                              checked={answers[q.key] === o.value}
                              onChange={() =>
                                handleAnswerChange(q.key, o.value, q.type)
                              }
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2">{o.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'checkbox' && (
                      <div className="space-x-4">
                        {q.options.map(o => (
                          <label
                            key={o.value}
                            className="inline-flex items-center"
                          >
                            <input
                              type="checkbox"
                              value={o.value}
                              checked={(answers[q.key] || []).includes(o.value)}
                              onChange={() =>
                                handleAnswerChange(q.key, o.value, q.type)
                              }
                              className="form-checkbox text-blue-600"
                            />
                            <span className="ml-2">{o.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

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
