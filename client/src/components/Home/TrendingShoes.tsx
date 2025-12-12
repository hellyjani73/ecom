import React from 'react';
import ProductCard from './ProductCard';

const TrendingShoes: React.FC = () => {
  const products = [
    {
      name: 'CLASSIC WHITE SNEAKERS',
      price: '89.90 DZD',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    },
    {
      name: 'RUNNING SHOES PRO',
      price: '120.00 DZD',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    },
    {
      name: 'CASUAL LEATHER BOOTS',
      price: '150.00 DZD',
      image: 'https://images.unsplash.com/photo-1608256246200-53bd35f3f995?w=400&h=400&fit=crop',
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Trending Shoes</h2>
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

export default TrendingShoes;

