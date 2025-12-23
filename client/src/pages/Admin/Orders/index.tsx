import React, { useState, useEffect, useReducer } from 'react';
import {
  Calendar,
  Download,
  Plus,
  ShoppingBag,
  Clock,
  CheckCircle,
  Wallet,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Printer,
  Mail,
  Truck,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { Order, OrderListFilters, OrderStatus, PaymentStatus } from '../../../services/types/order';
import { createToast, ToastContainer } from '../../../components/common/Toast';
import OrderDetailModal from './OrderDetailModal';
import { formatPrice } from '../../../utils/formatPrice';

interface OrderState {
  orders: Order[];
  selectedOrders: Set<string>;
  statistics: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalOrdersChange?: number;
    pendingOrdersChange?: number;
    completedOrdersChange?: number;
    totalRevenueChange?: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
}

type OrderAction =
  | { type: 'SET_ORDERS'; payload: { orders: Order[]; statistics: any; total: number; page: number; limit: number; totalPages: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SELECT_ORDER'; payload: string }
  | { type: 'DESELECT_ORDER'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UPDATE_ORDER'; payload: Order };

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload.orders,
        statistics: action.payload.statistics,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        totalPages: action.payload.totalPages,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SELECT_ORDER':
      const addSet = new Set(state.selectedOrders);
      addSet.add(action.payload);
      return {
        ...state,
        selectedOrders: addSet,
      };
    case 'DESELECT_ORDER':
      const newSet = new Set(state.selectedOrders);
      newSet.delete(action.payload);
      return { ...state, selectedOrders: newSet };
    case 'SELECT_ALL':
      return {
        ...state,
        selectedOrders: new Set(state.orders.map(o => o._id)),
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedOrders: new Set<string>() };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => o._id === action.payload._id ? action.payload : o),
      };
    default:
      return state;
  }
};

const AdminOrders: React.FC = () => {
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    selectedOrders: new Set<string>(),
    statistics: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    },
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
    loading: true,
  });

  const [filters, setFilters] = useState<OrderListFilters>({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'last30days',
    page: 1,
    limit: 25,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);
  const [sortColumn, setSortColumn] = useState<'orderId' | 'date' | 'customer' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchOrders();
  }, [filters, sortColumn, sortOrder]);

  const fetchOrders = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await orderService.GetAllOrders({
        ...filters,
        search: searchQuery || undefined,
        sortBy: sortColumn,
        sortOrder,
      });
      if (response.data.success) {
        dispatch({
          type: 'SET_ORDERS',
          payload: {
            orders: response.data.data.orders,
            statistics: response.data.data.statistics,
            total: response.data.data.total,
            page: response.data.data.page,
            limit: response.data.data.limit,
            totalPages: response.data.data.totalPages,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to fetch orders', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = createToast(message, type);
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSort = (column: 'orderId' | 'date' | 'customer' | 'total') => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (state.selectedOrders.has(orderId)) {
      dispatch({ type: 'DESELECT_ORDER', payload: orderId });
    } else {
      dispatch({ type: 'SELECT_ORDER', payload: orderId });
    }
  };

  const handleSelectAll = () => {
    if (state.selectedOrders.size === state.orders.length) {
      dispatch({ type: 'CLEAR_SELECTION' });
    } else {
      dispatch({ type: 'SELECT_ALL' });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (state.selectedOrders.size === 0) {
      showToast('Please select orders first', 'error');
      return;
    }
    // Implement bulk actions
    showToast(`Bulk action "${action}" executed`, 'success');
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const handleExport = async () => {
    try {
      const blob = await orderService.ExportOrders(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Orders exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export orders', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Order Management</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select className="pl-10 pr-4 py-2 border rounded-lg bg-white">
                <option>Last 30 days</option>
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
                <option>This month</option>
                <option>Last month</option>
                <option>Custom range</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Order</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <ChevronUp className="w-4 h-4" />
                <span>{state.statistics.totalOrdersChange?.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold">{state.statistics.totalOrders.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <ChevronDown className="w-4 h-4" />
                <span>{Math.abs(state.statistics.pendingOrdersChange || 0).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Pending Orders</p>
            <p className="text-2xl font-bold">{state.statistics.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <ChevronUp className="w-4 h-4" />
                <span>{state.statistics.completedOrdersChange?.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Completed Orders</p>
            <p className="text-2xl font-bold">{state.statistics.completedOrders}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <ChevronUp className="w-4 h-4" />
                <span>{state.statistics.totalRevenueChange?.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">{formatPrice(state.statistics.totalRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFilters({ ...filters, search: e.target.value, page: 1 });
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any, page: 1 })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select
              value={filters.paymentStatus || 'all'}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value as any, page: 1 })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_refunded">Partially Refunded</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">High Priority</button>
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New Orders</button>
              <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">Delayed</button>
            </div>
            <button
              onClick={() => {
                setFilters({
                  status: 'all',
                  paymentStatus: 'all',
                  dateRange: 'last30days',
                  page: 1,
                  limit: 25,
                });
                setSearchQuery('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {state.selectedOrders.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="font-medium text-blue-900">
            {state.selectedOrders.size} order{state.selectedOrders.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="">Bulk Actions</option>
              <option value="update_status">Update Status</option>
              <option value="export">Export Selected</option>
              <option value="print_invoices">Print Invoices</option>
              <option value="send_notifications">Send Notifications</option>
              <option value="delete">Delete Orders</option>
            </select>
            <button
              onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={state.selectedOrders.size === state.orders.length && state.orders.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('orderId')}
                >
                  <div className="flex items-center gap-1">
                    Order ID
                    {sortColumn === 'orderId' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date & Time
                    {sortColumn === 'date' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortColumn === 'customer' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    {sortColumn === 'total' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipping</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {state.loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : state.orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                state.orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={state.selectedOrders.has(order._id)}
                        onChange={() => handleSelectOrder(order._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {order.orderId}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {getInitials(order.customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.customer.name}</p>
                          <p className="text-xs text-gray-500">{order.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="text-gray-600">{order.items.length} items</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-4">{getPaymentBadge(order.payment.status)}</td>
                    <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">{order.shipping.method.replace('-', ' ')}</td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={state.limit}
              onChange={(e) => {
                setFilters({ ...filters, limit: Number(e.target.value), page: 1 });
              }}
              className="px-2 py-1 border rounded"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {((state.page - 1) * state.limit) + 1}-{Math.min(state.page * state.limit, state.total)} of {state.total} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: state.page - 1 })}
              disabled={state.page === 1}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              Page {state.page} of {state.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: state.page + 1 })}
              disabled={state.page >= state.totalPages}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={async (updatedOrder) => {
            try {
              // Call API to update order
              const response = await orderService.UpdateOrder(updatedOrder._id, {
                status: updatedOrder.status,
                payment: updatedOrder.payment,
                shipping: updatedOrder.shipping,
              });

              if (response.data.success) {
                const updatedOrderData = response.data.data;
                dispatch({ type: 'UPDATE_ORDER', payload: updatedOrderData });
                setSelectedOrder(updatedOrderData);
                showToast('Order updated successfully', 'success');
                // Refresh orders list to get updated statistics
                fetchOrders();
              } else {
                showToast(response.data.message || 'Failed to update order', 'error');
              }
            } catch (error: any) {
              console.error('Error updating order:', error);
              showToast(error.response?.data?.message || 'Failed to update order', 'error');
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminOrders;
