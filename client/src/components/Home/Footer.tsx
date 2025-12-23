import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-black">Nextgen</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            <div className="flex space-x-3">
              {/* X (Twitter) */}
              <a
                href="#twitter"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="#facebook"
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#linkedin"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                href="#github"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: COMPANY */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-600 hover:text-black transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#works" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Works
                </a>
              </li>
              <li>
                <a href="#career" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Career
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">HELP</h3>
            <ul className="space-y-2">
              <li>
                <a href="#support" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="#delivery" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Delivery Details
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: FAQ */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">FAQ</h3>
            <ul className="space-y-2">
              <li>
                <a href="#account" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Account
                </a>
              </li>
              <li>
                <a href="#deliveries" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Manage Deliveries
                </a>
              </li>
              <li>
                <a href="#orders" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Orders
                </a>
              </li>
              <li>
                <a href="#payments" className="text-gray-600 hover:text-black transition-colors text-sm">
                  Payments
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              Nextgen © 2025, All Rights Reserved
            </p>
            <div className="flex items-center space-x-4">
              {/* Payment Method Logos - Placeholder */}
              <div className="flex items-center space-x-2">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
                <div className="w-12 h-8 bg-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PP</span>
                </div>
                <div className="w-12 h-8 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AP</span>
                </div>
                <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">GP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



