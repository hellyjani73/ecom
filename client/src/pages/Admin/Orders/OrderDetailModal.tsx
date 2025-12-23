import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MapPin,
  Edit,
  Printer,
  Mail,
  Truck,
  RefreshCw,
  MoreVertical,
  Package,
  CreditCard,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../../services/types/order';
import { formatPrice } from '../../../utils/formatPrice';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (order: Order) => void;
}

type Tab = 'overview' | 'timeline' | 'customer' | 'items' | 'payment' | 'shipping' | 'notes';

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      partially_refunded: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePrintInvoice = () => {
    // Create a new window with invoice content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
            .address { line-height: 1.6; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p>Order ID: ${order.orderId}</p>
            <p>Date: ${formatDate(order.createdAt)}</p>
          </div>
          
          <div class="invoice-details">
            <div class="section">
              <h3>Bill To:</h3>
              <div class="address">
                <p><strong>${order.customer.name}</strong></p>
                <p>${order.customer.email}</p>
                ${order.customer.phone ? `<p>${order.customer.phone}</p>` : ''}
              </div>
            </div>
            <div class="section">
              <h3>Ship To:</h3>
              <div class="address">
                <p><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
                <p>${order.shippingAddress.addressLine1}</p>
                ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
                <p>${order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Order Items:</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}</td>
                    <td>${item.variantSku || item.productSku}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.unitPrice)}</td>
                    <td>${formatPrice(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <table>
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td style="text-align: right;">${formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td><strong>Shipping:</strong></td>
                <td style="text-align: right;">${formatPrice(order.shippingCost)}</td>
              </tr>
              <tr>
                <td><strong>Tax:</strong></td>
                <td style="text-align: right;">${formatPrice(order.tax)}</td>
              </tr>
              ${order.discount ? `
              <tr>
                <td><strong>Discount:</strong></td>
                <td style="text-align: right;">-${formatPrice(order.discount)}</td>
              </tr>
              ` : ''}
              <tr class="total">
                <td><strong>Total:</strong></td>
                <td style="text-align: right;">${formatPrice(order.total)}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <h3>Payment Information:</h3>
            <p>Payment Method: ${order.payment.method.toUpperCase()}</p>
            <p>Payment Status: ${order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1).replace('_', ' ')}</p>
            ${order.payment.transactionId ? `<p>Transaction ID: ${order.payment.transactionId}</p>` : ''}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handlePrintLabel = () => {
    // Create a shipping label
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
            .label-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .label-content { line-height: 1.8; }
            .label-footer { margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; text-align: center; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="label-header">
              <h2>SHIPPING LABEL</h2>
              <p><strong>Order ID: ${order.orderId}</strong></p>
            </div>
            <div class="label-content">
              <p><strong>Ship To:</strong></p>
              <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
              <p>${order.shippingAddress.country}</p>
              <br>
              <p><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</p>
              <p><strong>Items:</strong> ${order.items.length} item(s)</p>
              ${order.shipping.trackingNumber ? `<p><strong>Tracking:</strong> ${order.shipping.trackingNumber}</p>` : ''}
            </div>
            <div class="label-footer">
              <p><strong>From:</strong> NextGen E-commerce</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(labelContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: Package },
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end" onClick={onClose}>
        <div className="bg-white w-full max-w-4xl h-full overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b z-10 p-6 shadow-sm relative">
          
          <div className="flex items-center justify-between mb-4 pr-14">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{order.orderId}</h2>
                  <button
                    onClick={() => copyToClipboard(order.orderId, 'orderId')}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy Order ID"
                  >
                    {copied === 'orderId' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.payment.status)}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b items-center justify-between">
            <div className="flex gap-1">
              {(['overview', 'timeline', 'customer', 'items', 'payment', 'shipping', 'notes'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              title="Close Order Details"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div>
                <h3 className="font-bold text-lg mb-4">Order Status</h3>
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const currentStep = getCurrentStepIndex();
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

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Customer Information</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-lg font-medium">
                      {getInitials(order.customer.name)}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">{order.customer.email}</p>
                      {order.customer.phone && (
                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="font-bold text-lg mb-4">Items ({order.items.length})</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || 'https://via.placeholder.com/60x60?text=Product'}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && <p className="text-sm text-gray-600">{item.variantName}</p>}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-bold text-lg mb-4">Pricing Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  {order.discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-600">By {order.customer.name}</p>
                </div>
              </div>
              {order.payment.paidAt && (
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Payment Received</p>
                    <p className="text-sm text-gray-600">{formatDate(order.payment.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.shipping.shippedAt && (
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Shipped</p>
                    <p className="text-sm text-gray-600">{formatDate(order.shipping.shippedAt)}</p>
                    {order.shipping.trackingNumber && (
                      <p className="text-sm text-gray-600">Tracking: {order.shipping.trackingNumber}</p>
                    )}
                  </div>
                </div>
              )}
              {order.shipping.deliveredAt && (
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-gray-600">{formatDate(order.shipping.deliveredAt)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-medium">
                  {getInitials(order.customer.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{order.customer.name}</h3>
                  <p className="text-gray-600">{order.customer.email}</p>
                  {order.customer.phone && <p className="text-gray-600">{order.customer.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lifetime Value</p>
                  <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/100x100?text=Product'}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-lg">{item.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                      {item.variantName && <p className="text-sm text-gray-600">Variant: {item.variantName}</p>}
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm">Quantity: {item.quantity}</span>
                        <span className="text-sm">Unit Price: {formatPrice(item.unitPrice)}</span>
                        <span className="font-bold">Subtotal: {formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-gray-600 capitalize">{order.payment.method}</p>
                  </div>
                </div>
                {order.payment.transactionId && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm">{order.payment.transactionId}</span>
                    <button
                      onClick={() => copyToClipboard(order.payment.transactionId!, 'transactionId')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {copied === 'transactionId' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                )}
                {order.payment.paidAt && (
                  <p className="text-sm text-gray-600 mt-2">Paid on: {formatDate(order.payment.paidAt)}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Shipping Method</p>
                    <p className="text-sm text-gray-600 capitalize">{order.shipping.method.replace('-', ' ')}</p>
                  </div>
                </div>
                {order.shipping.carrier && (
                  <p className="text-sm text-gray-600">Carrier: {order.shipping.carrier}</p>
                )}
                {order.shipping.trackingNumber && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Tracking Number:</span>
                      <span className="font-mono text-sm">{order.shipping.trackingNumber}</span>
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
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm">
                      Track Order
                    </button>
                  </div>
                )}
                {order.shipping.estimatedDelivery && (
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated Delivery: {formatDate(order.shipping.estimatedDelivery)}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                />
                <button className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  Add Note
                </button>
              </div>
              {order.notes && order.notes.length > 0 ? (
                <div className="space-y-3">
                  {order.notes.map((note, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{note.type}</span>
                        <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                      {note.author && <p className="text-xs text-gray-500 mt-1">By {note.author}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notes yet</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex flex-wrap gap-3">
          <select 
            className="px-4 py-2 border rounded-lg"
            onChange={(e) => {
              if (e.target.value && e.target.value !== 'Update Status') {
                onUpdate({ ...order, status: e.target.value as OrderStatus });
                e.target.value = 'Update Status';
              }
            }}
          >
            <option>Update Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={handlePrintInvoice}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button 
            onClick={handlePrintLabel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            title="Print Shipping Label"
          >
            <Printer className="w-4 h-4" />
            Print Label
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <Mail className="w-4 h-4" />
            Resend Email
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <Truck className="w-4 h-4" />
            Track Shipment
          </button>
          <div className="ml-auto">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

