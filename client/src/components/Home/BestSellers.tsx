import React from 'react';
import ProductCard from './ProductCard';

const BestSellers: React.FC = () => {
  const products = [
    {
      name: 'KHAITEOLIVIA LEATHER BELT',
      price: '67.90 DZD',
      image: 'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=400&h=400&fit=crop',
    },
    {
      name: 'BOTTEGA VENETA BAG',
      price: '25.90 DZD',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    },
    {
      name: 'CELINE EYEWEAR SUNGLASSES',
      price: '45.00 DZD',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    },
    {
      name: 'URBAN DENIM JEANS CAP',
      price: '50.00 DZD',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    },
    {
      name: 'CORE CARRY BAG',
      price: '35.00 DZD',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Best Sellers in Accessories Items</h2>
          <a
            href="#view-all"
            className="text-gray-700 hover:text-black transition-colors flex items-center"
          >
            VIEW ALL <span className="ml-1">→</span>
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;

