import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Package, Heart, Star, MapPin, CreditCard, User, Bell, HelpCircle, LogOut,
  Menu, X
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';

const AccountLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: ROUTES.ACCOUNT_DASHBOARD },
    { icon: Package, label: 'My Orders', path: ROUTES.ACCOUNT_ORDERS },
    { icon: Heart, label: 'My Wishlist', path: ROUTES.ACCOUNT_WISHLIST },
    { icon: Star, label: 'My Reviews', path: ROUTES.ACCOUNT_REVIEWS },
    { icon: MapPin, label: 'Address Book', path: ROUTES.ACCOUNT_ADDRESSES },
    { icon: CreditCard, label: 'Payment Methods', path: ROUTES.ACCOUNT_PAYMENTS },
    { icon: User, label: 'Account Settings', path: ROUTES.ACCOUNT_SETTINGS },
    { icon: Bell, label: 'Notifications', path: ROUTES.ACCOUNT_NOTIFICATIONS },
    { icon: HelpCircle, label: 'Help & Support', path: ROUTES.ACCOUNT_HELP },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === ROUTES.ACCOUNT_DASHBOARD) {
      return location.pathname === ROUTES.ACCOUNT || location.pathname === ROUTES.ACCOUNT_DASHBOARD;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-black">Nextgen</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:sticky top-0 h-screen lg:h-auto
          w-64 bg-white border-r border-gray-200 z-30
          transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}>
          <div className="p-6">
            <div className="hidden lg:block mb-8">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold text-black">Nextgen</span>
              </Link>
            </div>

            {/* User Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;

