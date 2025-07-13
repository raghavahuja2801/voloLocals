import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms &amp; Conditions</h1>
          <div className="space-y-6 text-gray-800 text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p>
                Welcome to VoloLocals. By accessing or using our website and services, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before using our platform.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
              <p>
                VoloLocals connects users with local professionals. You agree to use the platform only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account information.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
              <p>
                To access certain features, you may need to create an account. You agree to provide accurate and complete information and to update it as necessary. You are responsible for all activities that occur under your account.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">4. Professional Listings</h2>
              <p>
                Professionals are responsible for the accuracy of their listings and compliance with all applicable laws and regulations. VoloLocals does not guarantee the quality or legality of services provided by professionals.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">5. Payments</h2>
              <p>
                Some services may require payment. All payments are processed securely. By making a payment, you agree to our pricing and refund policies.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
              <p>
                VoloLocals is not liable for any damages or losses resulting from your use of the platform or services provided by professionals. Use the platform at your own risk.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
              <p>
                We may update these Terms &amp; Conditions from time to time. Continued use of the platform constitutes acceptance of the revised terms.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
              <p>
                If you have any questions about these Terms &amp; Conditions, please contact us at{' '}
                <a href="mailto:support@vololocals.com" className="text-blue-600 underline">
                  support@vololocals.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}