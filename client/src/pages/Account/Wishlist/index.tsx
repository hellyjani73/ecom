import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Trash2, ShoppingCart } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useCart } from '../../../contexts/CartContext';
import ProductCard from '../../../components/Products/ProductCard';

const AccountWishlist: React.FC = () => {
  const { state } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">{state.items.length} items</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Wishlist
          </button>
        </div>
      </div>

      {state.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Start adding items you love</p>
          <Link
            to={ROUTES.PRODUCTS}
            className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {state.items.map((item) => (
            <ProductCard key={item.productId} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountWishlist;

