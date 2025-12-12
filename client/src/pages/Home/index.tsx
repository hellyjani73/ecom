import React, { useState } from 'react';
import Header from '../../components/Home/Header';
import Sidebar from '../../components/Home/Sidebar';
import BannerCarousel from '../../components/Home/BannerCarousel';
import BrowseCategories from '../../components/Home/BrowseCategories';
import BestSellers from '../../components/Home/BestSellers';
import TrendingShoes from '../../components/Home/TrendingShoes';
import BrandLogos from '../../components/Home/BrandLogos';
import Footer from '../../components/Home/Footer';
import BottomBar from '../../components/Home/BottomBar';

const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This should come from auth context
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        isLoggedIn={isLoggedIn}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-grow">
        <BannerCarousel />
        <BrowseCategories />
        <BestSellers />
        <TrendingShoes />
        <BrandLogos />
      </main>
      <Footer />
      <BottomBar wishlistCount={wishlistCount} cartCount={cartCount} />
    </div>
  );
};

export default Home;

