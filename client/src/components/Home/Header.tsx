import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, UserPlus } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  wishlistCount: number;
  cartCount: number;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ wishlistCount, cartCount, onMenuClick }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.PRODUCTS);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white border-b border-gray-200 transition-shadow ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-black">Nextgen</span>
            </Link>

            {/* Desktop Navigation Links - Only visible on lg and above */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link to={ROUTES.PRODUCTS} className="text-gray-700 hover:text-black transition-colors">
                Products
              </Link>
              <a href="#about" className="text-gray-700 hover:text-black transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-black transition-colors">
                Contact
              </a>
            </nav>

            {/* Search Bar - Desktop/Tablet in header, Mobile below */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Desktop Icons and Auth - Only visible on lg and above */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to={ROUTES.CART} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <Link
                  to={ROUTES.ACCOUNT_DASHBOARD}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="My Account"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-black transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="text-sm font-medium">Register</span>
                  </Link>
                </div>
              )}

            </div>

            {/* Hamburger Menu - Only visible below lg */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Below header on mobile */}
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </header>
    </>
  );
};

export default Header;

