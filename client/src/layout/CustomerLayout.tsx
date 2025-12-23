import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Home/Header';
import Sidebar from '../components/Home/Sidebar';
import Footer from '../components/Home/Footer';
import BottomBar from '../components/Home/BottomBar';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const CustomerLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const cartCount = cartState.itemCount;
  const wishlistCount = wishlistState.count;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BottomBar wishlistCount={wishlistCount} cartCount={cartCount} />
    </div>
  );
};

export default CustomerLayout;

