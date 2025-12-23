import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../../services/types/product';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { createToast } from '../common/Toast';
import { formatPrice } from '../../utils/formatPrice';

interface ProductCardProps {
  product: Product;
  onToast?: (toast: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onToast }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id);

  const getProductImage = (product: Product) => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    return primaryImage?.url || 'https://via.placeholder.com/400x400?text=Product';
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      product,
      quantity: 1,
      price: product.basePrice,
    });
    if (onToast) {
      onToast(createToast('Product added to cart', 'success'));
    }
  };

  const stock = product.productType === 'variant'
    ? product.totalStock || 0
    : product.stock || 0;
  const isNew = product.tags?.includes('new') || false;
  const imageUrl = getProductImage(product);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        {isNew && (
          <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded z-10">
            New Arrival
          </span>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={() => navigate(`/products/${product._id}`)}
          loading="lazy"
        />
        <button
          onClick={() => {
            if (isWishlisted) {
              removeFromWishlist(product._id);
              if (onToast) {
                onToast(createToast('Product removed from wishlist', 'info'));
              }
            } else {
              addToWishlist({
                productId: product._id,
                product,
                addedAt: new Date().toISOString(),
              });
              if (onToast) {
                onToast(createToast('Product added to wishlist', 'success'));
              }
            }
          }}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'text-red-500 fill-current' : 'text-gray-700'
            }`}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-1">{product.brand || 'Brand'}</p>
        <h3
          className="font-medium text-sm line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">(1200)</span>
        </div>
        <p className="font-bold text-lg mb-2">{formatPrice(product.basePrice)}</p>
        {stock > 0 && stock <= 10 && (
          <p className="text-sm text-red-600 font-medium mb-3">{stock} items left!</p>
        )}
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

