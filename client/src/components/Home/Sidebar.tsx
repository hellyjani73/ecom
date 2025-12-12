import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

interface SidebarProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isLoggedIn, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-lg font-bold text-black">Nextgen</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-4">
            <a
              href="#products"
              onClick={onClose}
              className="block text-gray-700 hover:text-black transition-colors py-2"
            >
              Products
            </a>
            <a
              href="#about"
              onClick={onClose}
              className="block text-gray-700 hover:text-black transition-colors py-2"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={onClose}
              className="block text-gray-700 hover:text-black transition-colors py-2"
            >
              Contact
            </a>
          </nav>

          {/* Login/Register - Only when not logged in */}
          {!isLoggedIn && (
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Link 
                to={ROUTES.LOGIN}
                onClick={onClose}
                className="block w-full px-4 py-2 text-gray-700 hover:text-black transition-colors text-left"
              >
                Login
              </Link>
              <Link 
                to={ROUTES.REGISTER}
                onClick={onClose}
                className="block w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

