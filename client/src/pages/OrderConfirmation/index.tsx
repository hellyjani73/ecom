import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // In a real app, you would fetch order details using orderId
  const orderDetails = {
    orderId: orderId || 'ORD-1234567890',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
    paymentMethod: 'Credit Card ending in 1234',
    total: 450.00,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
          <p className="text-gray-600 mb-8">
            Your order has been received and is being processed.
          </p>

          {/* Order Number */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold">{orderDetails.orderId}</p>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-left">Order Summary</h2>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(orderDetails.total * 0.82)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(orderDetails.total * 0.18)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(orderDetails.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="border-t pt-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Package className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div className="text-left flex-1">
                <h3 className="font-bold mb-1">Estimated Delivery</h3>
                <p className="text-gray-600">{orderDetails.estimatedDelivery}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div className="text-left flex-1">
                <h3 className="font-bold mb-1">Shipping Address</h3>
                <p className="text-gray-600">
                  {orderDetails.shippingAddress.name}<br />
                  {orderDetails.shippingAddress.address}<br />
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}<br />
                  {orderDetails.shippingAddress.country}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CreditCard className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div className="text-left flex-1">
                <h3 className="font-bold mb-1">Payment Method</h3>
                <p className="text-gray-600">{orderDetails.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Track Order
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

