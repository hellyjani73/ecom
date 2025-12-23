import React, { useState } from 'react';
import { Star, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const AccountReviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'published' | 'pending' | 'draft'>('published');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">Total reviews: 0</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {(['published', 'pending', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab} Reviews
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="text-center py-12 bg-white rounded-lg">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
        <p className="text-gray-600">Start reviewing your purchased products</p>
      </div>
    </div>
  );
};

export default AccountReviews;

