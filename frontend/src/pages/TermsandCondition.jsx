import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function TermsandCondition() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          iuhdekwhefkjwe
          
        </div>
      </main>
      <Footer />
    </div>
  )
}
