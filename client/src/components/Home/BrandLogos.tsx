import React from 'react';

const BrandLogos: React.FC = () => {
  const brands = [
    { name: 'Cool Club', logo: 'https://via.placeholder.com/150x60/FF0000/FFFFFF?text=COOL+CLUB' },
    { name: 'Celio', logo: 'https://via.placeholder.com/150x60/000000/FFFFFF?text=celio' },
    { name: 'LC Waikiki', logo: 'https://via.placeholder.com/150x60/0066CC/FFFFFF?text=LC+WAIKIKI' },
    { name: 'Camaieu', logo: 'https://via.placeholder.com/150x60/000000/FFFFFF?text=be+camaieu.' },
  ];

  return (
    <section className="bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Our Trusted Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 h-24 flex items-center justify-center hover:shadow-md transition-shadow"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;



