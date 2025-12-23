import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import { Category } from '../../services/types/category';
import { ROUTES } from '../../constants/routes';

const BrowseCategories: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.GetAllCategories();
      if (response.data.success) {
        // Filter only active categories
        const activeCategories = (response.data.data || []).filter(
          (cat: Category) => cat.isActive
        );
        setCategories(activeCategories);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on parentCategory type (not a relationship, just a type/classification)
  const filteredCategories = activeFilter === 'ALL' 
    ? categories 
    : categories.filter((cat: Category) => 
        cat.parentCategory?.toLowerCase() === activeFilter.toLowerCase()
      );

  return (
    <section className="px-4 py-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Browse by categories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${
              activeFilter === 'ALL'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ALL ({categories.length})
          </button>
          {categories.filter(cat => cat.parentCategory === 'men').length > 0 && (
            <button
              onClick={() => setActiveFilter('men')}
              className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                activeFilter === 'men'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MEN ({categories.filter(cat => cat.parentCategory === 'men').length})
            </button>
          )}
          {categories.filter(cat => cat.parentCategory === 'women').length > 0 && (
            <button
              onClick={() => setActiveFilter('women')}
              className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                activeFilter === 'women'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              WOMEN ({categories.filter(cat => cat.parentCategory === 'women').length})
            </button>
          )}
          {categories.filter(cat => cat.parentCategory === 'children').length > 0 && (
            <button
              onClick={() => setActiveFilter('children')}
              className={`px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                activeFilter === 'children'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CHILDREN ({categories.filter(cat => cat.parentCategory === 'children').length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No categories available in this section.</p>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="mt-4 text-blue-600 hover:underline"
            >
              View all categories
            </button>
          )}
        </div>
      ) : (
        // Show simple list of all categories (parentCategory is just a type/classification, not a relationship)
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
};

// Category Card Component
const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const navigate = useNavigate();
  
  // parentCategory is just a type/classification, not a relationship
  const getTypeLabel = (type?: string) => {
    if (!type) return null;
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleCategoryClick = () => {
    // Navigate to products page with category filter
    navigate(`${ROUTES.PRODUCTS}?category=${category._id}`);
  };

  return (
    <div 
      onClick={handleCategoryClick}
      className="relative h-48 sm:h-56 rounded-2xl overflow-hidden group cursor-pointer transform transition-transform hover:scale-105"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        onError={(e) => {
          // Fallback image if category image fails to load
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Category';
        }}
      />
      <div className="absolute top-3 right-3 z-20">
        {category.parentCategory && (
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
            {getTypeLabel(category.parentCategory)}
          </span>
        )}
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <span className="bg-white px-4 py-2 rounded-lg text-sm font-semibold text-black shadow-lg block text-center">
          {category.name}
        </span>
      </div>
    </div>
  );
};

export default BrowseCategories;


