import React, { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2, Check, Shield } from 'lucide-react';

const AccountPayments: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Payment Methods</h1>
          <p className="text-gray-600 mt-1">Your payment information is encrypted and secure</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {/* Security Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Secure Payment</p>
          <p className="text-sm text-blue-700">Your payment information is encrypted and PCI DSS compliant</p>
        </div>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No payment methods saved</h3>
          <p className="text-gray-600 mb-6">Add a payment method for faster checkout</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        •••• •••• •••• {method.last4 || '1234'}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.cardholderName}</p>
                    <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountPayments;

