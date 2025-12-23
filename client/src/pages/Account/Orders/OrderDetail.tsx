import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Copy, Check, Printer, Package, Truck, CheckCircle, RefreshCw, FileText, Mail, Headphones } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import { orderService } from '../../../services/orderService';
import { Order } from '../../../services/types/order';
import { formatPrice } from '../../../utils/formatPrice';

const AccountOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.GetOrderById(orderId!);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to={ROUTES.ACCOUNT_ORDERS} className="text-blue-600 hover:text-blue-800">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: RefreshCw },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    const stepMap: { [key: string]: number } = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    };
    return stepMap[order.status] ?? 0;
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to={ROUTES.ACCOUNT_DASHBOARD} className="text-gray-600 hover:text-gray-900">
          My Account
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to={ROUTES.ACCOUNT_ORDERS} className="text-gray-600 hover:text-gray-900">
          My Orders
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">Order #{order.orderId}</span>
      </nav>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h1>
              <button
                onClick={() => copyToClipboard(order.orderId, 'orderId')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {copied === 'orderId' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4">Order Status</h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`mt-2 text-xs ${isCompleted ? 'font-medium' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Tracking Info */}
        {order.shipping.trackingNumber && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium">{order.shipping.trackingNumber}</span>
                  <button
                    onClick={() => copyToClipboard(order.shipping.trackingNumber!, 'tracking')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copied === 'tracking' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Track Shipment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="font-bold text-lg mb-4">Order Items ({order.items.length})</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
              <img
                src={item.image || 'https://via.placeholder.com/100x100?text=Product'}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                {item.variantName && (
                  <p className="text-sm text-gray-600">{item.variantName}</p>
                )}
                <p className="text-sm text-gray-600">SKU: {item.variantSku || item.productSku}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatPrice(item.unitPrice)}</p>
                <p className="text-sm text-gray-600">Subtotal: {formatPrice(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing & Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Pricing Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatPrice(order.tax)}</span>
            </div>
            {order.discount && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Delivery Address</h3>
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-3">
          {order.status === 'pending' && (
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Cancel Order
            </button>
          )}
          {order.status === 'delivered' && (
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Request Return/Exchange
            </button>
          )}
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Contact Support
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Leave Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountOrderDetail;

