import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, FileText, Plus } from 'lucide-react';

const AccountHelp: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('orders');

  const categories = [
    { id: 'orders', label: 'Orders & Tracking' },
    { id: 'returns', label: 'Returns & Refunds' },
    { id: 'payment', label: 'Payment Issues' },
    { id: 'account', label: 'Account Management' },
    { id: 'product', label: 'Product Questions' },
    { id: 'shipping', label: 'Shipping Information' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Help & Support</h1>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
          <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
          <p className="text-sm text-gray-600">Chat with our support team</p>
          <span className="text-xs text-green-600 mt-2 inline-block">Online</span>
        </button>
        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
          <Mail className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
          <p className="text-sm text-gray-600">support@nextgen.com</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Response within 24 hours</span>
        </button>
        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
          <Phone className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Phone Support</h3>
          <p className="text-sm text-gray-600">+91 1800-XXX-XXXX</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">Mon-Fri, 9 AM - 6 PM</span>
        </button>
      </div>

      {/* Quick Help Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Help</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeCategory === category.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">{category.label}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Support Tickets</h2>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No support tickets yet</p>
        </div>
      </div>
    </div>
  );
};

export default AccountHelp;

