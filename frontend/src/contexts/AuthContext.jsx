import React, { createContext, useContext, useState, useEffect } from 'react'

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
      const res = await fetch('http://localhost:3000/api/auth/profile', {
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
    const res = await fetch('http://localhost:3000/api/auth/login', {
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



  async function register(email, password, displayName, role) {
    setAuthLoading(true)
    // 1) register
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, role }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Registration failed')
    }

    // 2) login (so cookie is set)
    await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => {
      if (!r.ok) throw new Error('Login failed')
    })

    // 3) re–fetch profile
    const profile = await fetch('http://localhost:3000/api/auth/profile', {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error('Profile failed')
        return json.user
      })

    setCurrentUser(profile)
    setAuthLoading(false)
    return profile
  }

  const logout = async () => {
    await fetch('http://localhost:3000/api/auth/logout', {
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
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
