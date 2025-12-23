import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Heart, Gift, Package, ArrowRight, Truck, FileText, Headphones } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { ROUTES } from '../../../constants/routes';
import { orderService } from '../../../services/orderService';
import { Order } from '../../../services/types/order';
import { formatPrice } from '../../../utils/formatPrice';

const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistItems: wishlistState.count,
    rewardPoints: 1250,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.GetAllOrders({ page: 1, limit: 5 });
      if (response.data.success) {
        setRecentOrders(response.data.data.orders || []);
        setStats({
          totalOrders: response.data.data.statistics?.totalOrders || 0,
          pendingOrders: response.data.data.statistics?.pendingOrders || 0,
          wishlistItems: wishlistState.count,
          rewardPoints: 1250,
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-2xl">
                {user?.name ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Member since Recently
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.ACCOUNT_SETTINGS}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <Link to={ROUTES.ACCOUNT_ORDERS} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          <p className="text-gray-600 text-sm">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <Link to={ROUTES.ACCOUNT_ORDERS} className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">
              Track Now
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
          <p className="text-gray-600 text-sm">Pending Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <Link to={ROUTES.ACCOUNT_WISHLIST} className="text-pink-600 hover:text-pink-800 text-sm font-medium">
              View Wishlist
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</h3>
          <p className="text-gray-600 text-sm">Wishlist Items</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Redeem
            </button>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stats.rewardPoints.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Reward Points</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link
            to={ROUTES.ACCOUNT_ORDERS}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            View All Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
            <Link
              to={ROUTES.PRODUCTS}
              className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">#{order.orderId}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                    <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <Link
                    to={`${ROUTES.ACCOUNT_ORDERS}/${order._id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                  {order.status === 'shipped' && (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Truck className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Track Order</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Package className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Return/Exchange</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Headphones className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Contact Support</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Download Invoices</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;

