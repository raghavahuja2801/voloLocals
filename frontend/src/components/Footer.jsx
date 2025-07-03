import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700">
      <div className="container mx-auto px-4 py-8">
        {/* Top links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* For Customers */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-3">For Customers</h4>
            <ul className="space-y-2">
              <li><a href="/en/gb/" className="hover:text-gray-900">Find a Professional</a></li>
              <li><a href="/en/gb/how-it-works/customers/" className="hover:text-gray-900">How it works</a></li>
              <li><a href="/en/gb/login/" className="hover:text-gray-900">Login</a></li>
              <li><a href="/en/gb/get-the-app/buyers/" className="hover:text-gray-900">Mobile App</a></li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-3">For Professionals</h4>
            <ul className="space-y-2">
              <li><a href="/en/gb/how-it-works/sellers/" className="hover:text-gray-900">How it works</a></li>
              <li><a href="/en/gb/sellers/pricing/" className="hover:text-gray-900">Pricing</a></li>
              <li><a href="/en/gb/sellers/create/" className="hover:text-gray-900">Join as a Professional</a></li>
              <li><a href="https://help.bark.com/hc/en-gb/" className="hover:text-gray-900">Help centre</a></li>
              <li><a href="/en/gb/get-the-app/sellers/" className="hover:text-gray-900">Mobile App</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-3">About</h4>
            <ul className="space-y-2">
              <li><a href="https://careers.bark.com/#our-journey" className="hover:text-gray-900">About VoloLocals</a></li>
              <li><a href="https://careers.bark.com" className="hover:text-gray-900">Careers</a></li>
              <li><a href="/en/gb/affiliates/" className="hover:text-gray-900">Affiliates</a></li>
              <li><a href="/blog/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Blog</a></li>
              <li><a href="https://bark.com/press" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Press</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-start sm:items-end">
            <p className="mb-2 font-medium text-gray-900">Need help?</p>
            <a
              href="https://help.bark.com/hc/en-gb/articles/17639389954076"
              className="mb-4 px-4 py-2 bg-blue-600  text-white font-semibold shadow rounded hover:bg-blue-700 transition font-color: white"
            >
              Contact us
            </a>
            <div className="flex space-x-4 mb-4">
              <a href="https://twitter.com/barkteam?lang=en" target="_blank" rel="noopener noreferrer">
                <img src="https://d18jakcjgoan9.cloudfront.net/s/img/images/material-icons/icon-twitter.png!d=2M4f26" alt="Twitter" width="24" height="24" />
              </a>
              <a href="https://www.facebook.com/barkteam/" target="_blank" rel="noopener noreferrer">
                <img src="https://d18jakcjgoan9.cloudfront.net/s/img/images/material-icons/icon-facebook.png!d=2M4f26" alt="Facebook" width="24" height="24" />
              </a>
              <a href="https://www.linkedin.com/company/bark-com/about/" target="_blank" rel="noopener noreferrer">
                <img src="https://d18jakcjgoan9.cloudfront.net/s/img/images/material-icons/icon-linkedin.png!d=2M4f26" alt="LinkedIn" width="24" height="24" />
              </a>
            </div>
           
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Bottom row */}
        <div className="flex flex-col lg:flex-row justify-between items-center text-sm space-y-4 lg:space-y-0">
          <div className="text-gray-500 text-center lg:text-left">
            <div>
            © 2025 voloLocals
            </div>
            <a href="/en/gb/terms/" className="ml-1 hover:text-gray-700"> 
            Terms &amp; Conditions</a> |
            <a href="/en/gb/privacy/" className="hover:text-gray-700"> Privacy policy</a>

          </div>
        </div>
      </div>
    </footer>
  )
}