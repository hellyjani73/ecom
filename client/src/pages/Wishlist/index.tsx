import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { createToast, ToastContainer } from '../../components/common/Toast';
import { ROUTES } from '../../constants/routes';
import { formatPrice } from '../../utils/formatPrice';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { state, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [toasts, setToasts] = useState<any[]>([]);

  const showToast = (toast: any) => {
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getProductImage = (product: any) => {
    const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
    return primaryImage?.url || 'https://via.placeholder.com/300x300?text=Product';
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.product._id,
      product: item.product,
      quantity: 1,
      price: item.product.basePrice,
    });
    showToast(createToast('Product added to cart', 'success'));
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Add products to your wishlist to save them for later</p>
          <button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist ({state.count})</h1>
          {state.items.length > 0 && (
            <button
              onClick={() => {
                clearWishlist();
                showToast(createToast('Wishlist cleared', 'info'));
              }}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {state.items.map((item) => (
            <div key={item.productId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => navigate(`/products/${item.product._id}`)}
                  loading="lazy"
                />
                <button
                  onClick={() => {
                    removeFromWishlist(item.productId);
                    showToast(createToast('Product removed from wishlist', 'info'));
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-1">{item.product.brand || 'Brand'}</p>
                <h3
                  className="font-medium text-sm line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/products/${item.product._id}`)}
                >
                  {item.product.name}
                </h3>
                <p className="font-bold text-lg mb-3">{formatPrice(item.product.basePrice)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart(item);
                      navigate(ROUTES.CART);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

