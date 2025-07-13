import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 min-w-screen">
      <Navbar />
      <main className="flex-grow px-8 py-16 flex justify-center">
        <div className="w-full max-w-7xl bg-transparent p-12">
          {/* Header */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">Updated: July 13, 2025</p>

          {/* Policy Content */}
          <section className="space-y-10 text-gray-800 text-lg leading-relaxed">
            <article>
              <h2 className="text-3xl font-semibold mb-3">1. Overview</h2>
              <p>
                The Privacy Policy outlines how personal data submitted via the website{' '}
                <a href="https://www.vololocals.com" className="text-blue-600 underline">
                  www.vololocals.com
                </a>{' '}
                and related services is collected, managed, and safeguarded by VoloLocals.
              </p>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">2. Information Collected</h2>
              <p>Collected data includes:</p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>Account details: email address, username, encrypted password</li>
                <li>Profile information: photos, service descriptions, ratings</li>
                <li>Contact details: phone number, address</li>
                <li>Usage data: pages visited, search queries, device information</li>
                <li>Transaction records: payment method and billing address</li>
              </ul>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">3. Use of Data</h2>
              <p>Data is used for:</p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>Account creation and authentication</li>
                <li>Connecting customers with professionals</li>
                <li>Secure payment processing</li>
                <li>Service notifications and support communications</li>
                <li>Platform analysis and improvements</li>
              </ul>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">4. Data Sharing</h2>
              <p>Data may be shared with:</p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>Third-party providers for hosting and payment processing</li>
                <li>Professionals fulfilling specific service requests</li>
                <li>Legal authorities when required by law</li>
                <li>Parties involved in business transactions</li>
              </ul>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">5. Cookies and Tracking</h2>
              <p>
                Cookies and similar technologies personalize the experience, remember preferences,
                and collect analytics. Cookie settings can be managed via the cookie banner or browser
                preferences.
              </p>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">6. User Rights</h2>
              <p>Depending on applicable laws, users may have the right to:</p>
              <ul className="list-disc list-inside ml-6 space-y-2">
                <li>Access or correct personal data</li>
                <li>Request deletion of personal data</li>
                <li>Restrict or object to data processing</li>
                <li>Withdraw consent where provided</li>
              </ul>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">7. Data Retention</h2>
              <p>
                Personal data is retained only as long as necessary for service provision,
                legal compliance, and dispute resolution.
              </p>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">8. International Transfers</h2>
              <p>
                Data may be transferred to servers outside the user’s country. Adequate safeguards
                are in place to protect transferred data.
              </p>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">9. Policy Updates</h2>
              <p>
                Updates to this policy will be posted on the website. Significant changes may be
                communicated via email notifications.
              </p>
            </article>

            <article>
              <h2 className="text-3xl font-semibold mb-3">10. Contact Information</h2>
              <p>
                Inquiries regarding personal data can be sent to{' '}
                <a href="mailto:privacy@vololocals.com" className="text-blue-600 underline">
                  privacy@vololocals.com
                </a>.
              </p>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
