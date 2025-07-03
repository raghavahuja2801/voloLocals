import React, { useState } from 'react'
import { Menu, X, ChevronDown, ChevronRight, User } from 'lucide-react'

/**
 * Props:
 * - isLoggedIn: boolean
 */
export default function Navbar({ isLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  const authLinks = isLoggedIn
    ? [{ label: 'My Requests', href: '/requests' }, { label: 'Account', href: '/account' }]
    : [{ label: 'Login', href: '/login' }, { label: 'Join as a Professional', href: '/join' }]

  const exploreSections = [
    {
      title: 'Services',
      seeAll: '/all-categories',
      items: [
        { label: 'Business', href: '/business' },
        { label: 'Events & Entertainers', href: '/events' },
        { label: 'Health & Wellness', href: '/health' },
        { label: 'House & Home', href: '/home' },
        { label: 'Lessons & Training', href: '/lessons' },
        { label: 'More', href: '/more' }
      ]
    },
    {
      title: 'Popular Services',
      seeAll: '/popular-services',
      items: [
        { label: 'Dog & Pet Grooming', href: '/pet-grooming' },
        { label: 'Dog Training', href: '/dog-training' },
        { label: 'Dog Walking', href: '/dog-walking' },
        { label: 'Life Coaching', href: '/life-coaching' },
        { label: 'Limousine Hire', href: '/limousine-hire' },
        { label: 'Magician', href: '/magician' },
        { label: 'Private Investigators', href: '/private-investigators' }
      ]
    }
  ]

  return (
    <nav className="sticky top-0 bg-white border-b shadow z-30">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Logo + Explore */}
        <div className="flex items-center space-x-8">
          <a href="/" className="flex items-center">
            <img src="/image.png" alt="Logo" className="h-14 w-auto" />
          </a>
          <div className="hidden md:block relative">
            <button
              onClick={() => setExploreOpen(o => !o)}
              className="flex items-center text-gray-800 hover:text-gray-900 font-medium"
            >
              Explore <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg transition-opacity duration-200 ${
                exploreOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              style={{ minWidth: '360px' }}
            >
              <div className="grid grid-cols-1 gap-6 p-4">
                {exploreSections.map(sec => (
                  <div key={sec.title}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{sec.title}</span>
                      <a href={sec.seeAll} className="text-sm text-gray-500 hover:text-gray-700">
                        See all
                      </a>
                    </div>
                    <ul className="space-y-2">
                      {sec.items.map(item => (
                        <li key={item.label}>
                          <a
                            href={item.href}
                            className="flex justify-between items-center text-gray-600 hover:text-gray-900"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth Links & Mobile Toggle */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6">
            <a href={authLinks[0].href} className="text-gray-800 hover:text-gray-900 font-medium">
              {authLinks[0].label}
            </a>
            <a
              href={authLinks[1].href}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              {authLinks[1].label === 'Join as a Professional' && <User className="w-4 h-4 mr-2 text-white" />}
              <span className="text-white font-medium">{authLinks[1].label}</span>
            </a>
          </div>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden bg-white p-2 rounded focus:outline-none"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide Down */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white border-t ${
          menuOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col divide-y">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setExploreOpen(o => !o)}
              className="w-full text-left flex justify-between items-center text-gray-800 font-medium"
            >
              Explore <ChevronDown className={`w-5 h-5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>
            {exploreOpen && (
              <div className="mt-4 space-y-4">
                {exploreSections.map(sec => (
                  <div key={sec.title}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{sec.title}</span>
                      <a href={sec.seeAll} className="text-sm text-gray-500 hover:text-gray-700">
                        See all
                      </a>
                    </div>
                    <ul className="space-y-2">
                      {sec.items.map(item => (
                        <li key={item.label}>
                          <a href={item.href} className="block text-gray-600 hover:text-gray-900">
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 space-y-2 text-center">
            <a href={authLinks[0].href} className="block text-gray-800 hover:text-gray-900 font-medium">
              {authLinks[0].label} 
            </a>
            <a
              href={authLinks[1].href}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              {authLinks[1].label === 'Join as a Professional' && <User className="w-4 h-4 mr-2 text-white" />}
              <span className="text-white font-medium">{authLinks[1].label}</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}