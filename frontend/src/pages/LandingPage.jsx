// src/pages/LandingPage.jsx
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
     <div className="flex flex-col flex-1 min-h-screen w-screen bg-white overflow-x-hidden">
      <Navbar isLoggedIn={false} />
      <main className="flex-grow flex flex-col items-start justify-center bg-gray-50 w-full">
+        <div className="w-full max-w-4xl mx-auto text-center md:text-left px-4 py-24 md:py-48">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to VoloLocals</h1>
        <p className="text-xl text-gray-600 mb-8">Find and hire local professionals in minutes</p>
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
        >
          Get Started
        </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}

