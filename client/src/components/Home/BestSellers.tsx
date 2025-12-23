import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../Products/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../services/types/product';
import { createToast, ToastContainer } from '../common/Toast';
import { ROUTES } from '../../constants/routes';

const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Fetch featured products using public endpoint, limit to 5 for best sellers section
      const response = await productService.GetFeaturedProducts(5);

      if (response.data.success) {
        const featuredProducts = response.data.data.products || [];
        setProducts(featuredProducts);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Set empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (toast: any) => {
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <section className="bg-gray-50 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold mb-2 sm:mb-0">Best Sellers in Accessories Items</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="bg-gray-50 px-4 py-12">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Best Sellers in Accessories Items</h2>
          <Link
            to={ROUTES.PRODUCTS}
            className="text-gray-700 hover:text-black transition-colors flex items-center"
          >
            VIEW ALL <span className="ml-1">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onToast={showToast}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;



