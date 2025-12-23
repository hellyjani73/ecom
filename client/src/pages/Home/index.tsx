import React from 'react';
import BannerCarousel from '../../components/Home/BannerCarousel';
import BrowseCategories from '../../components/Home/BrowseCategories';
import BestSellers from '../../components/Home/BestSellers';
import TrendingShoes from '../../components/Home/TrendingShoes';
import BrandLogos from '../../components/Home/BrandLogos';

const Home: React.FC = () => {
  return (
    <>
      <BannerCarousel />
      <BrowseCategories />
      <BestSellers />
      <TrendingShoes />
      <BrandLogos />
    </>
  );
};

export default Home;

