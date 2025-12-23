import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, LogIn } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { generateCartItemId } from '../../utils/cartUtils';
import { formatPrice } from '../../utils/formatPrice';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { state, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store the checkout attempt to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', ROUTES.CHECKOUT);
      navigate(ROUTES.LOGIN);
    } else {
      navigate(ROUTES.CHECKOUT);
    }
  };

  const getProductImage = (item: any) => {
    if (item.variant?.images && item.variant.images.length > 0) {
      return item.variant.images[0].url;
    }
    const primaryImage = item.product.images?.find((img: any) => img.isPrimary) || item.product.images?.[0];
    return primaryImage?.url || 'https://via.placeholder.com/150x150?text=Product';
  };

  const getItemName = (item: any) => {
    if (item.variant) {
      return `${item.product.name} - ${item.variant.variantName}`;
    }
    return item.product.name;
  };

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <button
            onClick={() => navigate('/products')}
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
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => {
              const itemId = generateCartItemId(item);
              return (
                <div key={itemId} className="bg-white rounded-lg p-6 flex gap-4">
                  <img
                    src={getProductImage(item)}
                    alt={getItemName(item)}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium mb-1">{getItemName(item)}</h3>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                        )}
                        {item.selectedColor && (
                          <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                {subtotal < 500 && (
                  <p className="text-sm text-blue-600">
                    Add {formatPrice(500 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm mb-2">
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Sign in required</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    Please sign in or create an account to proceed with checkout.
                  </p>
                </div>
              )}
              <button
                onClick={handleCheckout}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                {!isAuthenticated && <LogIn className="w-5 h-5" />}
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

