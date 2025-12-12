import React, { useState } from 'react';

const BrowseCategories: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const categories = [
    { name: 'SHOES', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { name: 'BRUSH', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop' },
    { name: 'BAG', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
    { name: 'T-SHIRT', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
  ];

  return (
    <section className="px-4 py-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Browse by categories</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setActiveFilter('WOMAN')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeFilter === 'WOMAN'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            WOMAN
          </button>
          <button
            onClick={() => setActiveFilter('CHILDREN')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeFilter === 'CHILDREN'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            CHILDREN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="relative h-48 sm:h-56 rounded-2xl overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <span className="bg-white px-3 py-1 rounded-lg text-sm font-medium text-black">
                {category.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrowseCategories;

