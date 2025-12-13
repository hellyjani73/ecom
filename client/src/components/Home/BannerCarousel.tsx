import React, { useState, useEffect } from 'react';

const BannerCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      gradient: 'bg-gradient-to-r from-slate-900 to-slate-700',
      headline: 'New Collection 2025',
      subtitle: 'Discover the latest trends in fashion',
    },
    {
      gradient: 'bg-gradient-to-r from-blue-900 to-blue-700',
      headline: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
    },
    {
      gradient: 'bg-gradient-to-r from-purple-900 to-purple-700',
      headline: 'Premium Quality',
      subtitle: 'Shop the finest products for your style',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 ${slide.gradient} flex items-center justify-center transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-center text-white px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {slide.headline}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-6">{slide.subtitle}</p>
            <button className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Arrow Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
      >
        <svg
          className="w-6 h-6 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;


