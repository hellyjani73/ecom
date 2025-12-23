import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import { generateCartItemId } from '../../utils/cartUtils';
import { formatPrice } from '../../utils/formatPrice';
import { LogIn, UserPlus } from 'lucide-react';
import { orderService } from '../../services/orderService';

interface FormErrors {
  [key: string]: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { state: cartState, clearCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Contact Information
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the checkout attempt in sessionStorage to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', ROUTES.CHECKOUT);
    }
  }, [isAuthenticated, isLoading]);

  // Pre-fill email when user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Shipping Address
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'next-day'>('standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!phone) newErrors.phone = 'Phone is required';
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!postalCode) newErrors.postalCode = 'Postal code is required';

    if (paymentMethod === 'card') {
      if (!cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!cardholderName) newErrors.cardholderName = 'Cardholder name is required';
      if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!cvv) newErrors.cvv = 'CVV is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare order data
      const orderData = {
        customer: {
          name: `${firstName} ${lastName}`,
          email,
          phone,
        },
        items: cartState.items.map(item => {
          const productImage = getProductImage(item);
          return {
            productId: item.product._id,
            productName: getItemName(item),
            productSku: item.product.sku,
            variantName: item.variant?.variantName,
            variantSku: item.variant?.sku,
            image: productImage,
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
            attributes: item.variant?.attributes || {},
          };
        }),
        shippingAddress: {
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          state: state,
          postalCode,
          country,
        },
        billingAddress: billingSameAsShipping ? {
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          state: state,
          postalCode,
          country,
        } : {
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          state: state,
          postalCode,
          country,
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
          transactionId: paymentMethod === 'card' ? `TXN-${cardNumber.slice(-4)}-${Date.now()}` : undefined,
        },
        shipping: {
          method: shippingMethod,
          estimatedDelivery: new Date(Date.now() + (shippingMethod === 'next-day' ? 1 : shippingMethod === 'express' ? 3 : 7) * 24 * 60 * 60 * 1000).toISOString(),
        },
        subtotal,
        shippingCost: shipping,
        tax,
        total,
      };

      const response = await orderService.CreateOrder(orderData);
      if (response.data.success) {
        clearCart();
        navigate(`/order-confirmation/${response.data.data.orderId || response.data.data._id}`);
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (item: any) => {
    if (item.variant?.images && item.variant.images.length > 0) {
      return item.variant.images[0].url;
    }
    const primaryImage = item.product.images?.find((img: any) => img.isPrimary) || item.product.images?.[0];
    return primaryImage?.url || 'https://via.placeholder.com/100x100?text=Product';
  };

  const getItemName = (item: any) => {
    if (item.variant) {
      return `${item.product.name} - ${item.variant.variantName}`;
    }
    return item.product.name;
  };

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCosts = {
    standard: 0,
    express: 50,
    'next-day': 100,
  };
  const shipping = subtotal > 500 ? 0 : shippingCosts[shippingMethod];
  const tax = subtotal * 0.18; // 18% GST for India
  const total = subtotal + shipping + tax;

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to proceed with checkout. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLogin', ROUTES.CHECKOUT);
                  navigate(ROUTES.LOGIN);
                }}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLogin', ROUTES.CHECKOUT);
                  navigate(ROUTES.REGISTER);
                }}
                className="flex-1 border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Sign Up
              </button>
            </div>
            <button
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="mt-4 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800"
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
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+91 12345 67890"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className={`w-full border rounded-lg px-4 py-2 ${errors.addressLine1 ? 'border-red-500' : ''}`}
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 ${errors.city ? 'border-red-500' : ''}`}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State/Province</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 ${errors.state ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 ${errors.postalCode ? 'border-red-500' : ''}`}
                      />
                      {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'Standard (5-7 days)', price: subtotal > 200 ? 'Free' : 'Free' },
                    { value: 'express', label: 'Express (2-3 days)', price: 'SAR 15.00' },
                    { value: 'next-day', label: 'Next Day', price: 'SAR 30.00' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        shippingMethod === method.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.value}
                          checked={shippingMethod === method.value}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                        />
                        <span className="font-medium">{method.label}</span>
                      </div>
                      <span className="font-bold">{method.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3 mb-4">
                  {[
                    { value: 'card', label: 'Credit Card' },
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'cod', label: 'Cash on Delivery' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                      />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                        className={`w-full border rounded-lg px-4 py-2 ${errors.cardNumber ? 'border-red-500' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className={`w-full border rounded-lg px-4 py-2 ${errors.cardholderName ? 'border-red-500' : ''}`}
                      />
                      {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiration Date (MM/YY)</label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setExpiryDate(value);
                          }}
                          className={`w-full border rounded-lg px-4 py-2 ${errors.expiryDate ? 'border-red-500' : ''}`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className={`w-full border rounded-lg px-4 py-2 ${errors.cvv ? 'border-red-500' : ''}`}
                          placeholder="123"
                          maxLength={3}
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={billingSameAsShipping}
                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      />
                      <span className="text-sm">Billing address same as shipping</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cartState.items.map((item) => {
                    const itemId = generateCartItemId(item);
                    return (
                      <div key={itemId} className="flex gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={getItemName(item)}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getItemName(item)}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-4 space-y-2 mb-4">
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
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
                <div className="mt-4 text-xs text-gray-500 space-y-2">
                  <p>🔒 Secure checkout</p>
                  <p>30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

