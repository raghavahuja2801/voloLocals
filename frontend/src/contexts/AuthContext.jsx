import React, { createContext, useContext, useState, useEffect } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const AuthContext = createContext()
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)



  // Fetch user profile from backend using stored cookie
  const fetchProfile = async () => {
    try {
      console.log('Fetching profile from:', `${API_BASE_URL}/api/auth/profile`)
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      } else {
        setCurrentUser(null)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      setCurrentUser(null)
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Login failed')
    }
    await fetchProfile()
  }



  async function register(email, password, displayName, phone, role) {
    setAuthLoading(true)
    // 1) register
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, phone, role }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Registration failed')
    }

   login(email, password)
    setAuthLoading(false)
  }

  async function registerProfessional({
    email,
    password,
    displayName,
    phone,
    businessName,
    serviceCategories,
    serviceAreas,
    licenseNumber,
    availability
  }) {
    setAuthLoading(true)
    // 1) register
    const res = await fetch(`${API_BASE_URL}/api/contractor/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        displayName,
        phone,
        businessName,
        serviceCategories,
        serviceAreas,
        licenseNumber,
        availability,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Registration failed')
    }

   login(email, password)
    setAuthLoading(false)
  }

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setCurrentUser(null)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    registerProfessional,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
