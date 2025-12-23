import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, User, ArrowRight } from 'lucide-react';
import './Dashboard.css';
import { analyticsService, MostSellingProduct, WeeklyTopCustomer, DashboardStats } from '../../../services/analyticsService';
import { Order } from '../../../services/types/order';
import { ROUTES } from '../../../constants/routes';
import { formatPrice } from '../../../utils/formatPrice';

const AdminDashboard: React.FC = () => {
  const [mostSellingProducts, setMostSellingProducts] = useState<MostSellingProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topCustomers, setTopCustomers] = useState<WeeklyTopCustomer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, customersRes, statsRes] = await Promise.all([
        analyticsService.GetMostSellingProducts(3),
        analyticsService.GetRecentOrders(3),
        analyticsService.GetWeeklyTopCustomers(3),
        analyticsService.GetDashboardStats(),
      ]);

      if (productsRes.data.success) {
        setMostSellingProducts(productsRes.data.data);
      }
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data);
      }
      if (customersRes.data.success) {
        setTopCustomers(customersRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'canceled',
    };
    return colors[status] || 'pending';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome Back, Admin!</h1>
          <p className="dashboard-subtitle">Here's what happening with your store today</p>
        </div>
        <div className="dashboard-actions">
          <select className="time-select">
            <option>Previous Year</option>
            <option>Last Month</option>
            <option>Last Week</option>
          </select>
          <button className="view-all-btn">View All Time</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <div className="kpi-header">
            <span className="kpi-label">Ecommerce Revenue</span>
            {stats && stats.lastMonthRevenue > 0 && (
              <span className={`kpi-trend ${stats.totalRevenue >= stats.lastMonthRevenue ? 'positive' : 'negative'}`}>
                {stats.totalRevenue >= stats.lastMonthRevenue ? '↑' : '↓'} {Math.abs(((stats.totalRevenue / stats.lastMonthRevenue - 1) * 100)).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="kpi-value">{stats ? formatPrice(stats.totalRevenue) : '₹0.00'}</div>
          <div className="kpi-change positive">Total Revenue</div>
        </div>

        <div className="kpi-card customers">
          <div className="kpi-header">
            <span className="kpi-label">New Customers</span>
            <span className="kpi-trend positive">↑ This Week</span>
          </div>
          <div className="kpi-value">{stats ? stats.newCustomers : 0}</div>
          <div className="kpi-change positive">Last 7 days</div>
        </div>

        <div className="kpi-card repeat">
          <div className="kpi-header">
            <span className="kpi-label">Repeat Purchase Rate</span>
            <span className="kpi-trend positive">↑ Active</span>
          </div>
          <div className="kpi-value">{stats ? stats.repeatPurchaseRate.toFixed(2) : '0.00'}%</div>
          <div className="kpi-change positive">Repeat Customers</div>
        </div>

        <div className="kpi-card aov">
          <div className="kpi-header">
            <span className="kpi-label">Average Order Value</span>
            <span className="kpi-trend positive">↑ Average</span>
          </div>
          <div className="kpi-value">{stats ? formatPrice(stats.avgOrderValue) : '₹0.00'}</div>
          <div className="kpi-change positive">Per Order</div>
        </div>

        <div className="kpi-card conversion">
          <div className="kpi-header">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-trend positive">↑ All Time</span>
          </div>
          <div className="kpi-value">{stats ? stats.totalOrders : 0}</div>
          <div className="kpi-change positive">Completed Orders</div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Summary</h3>
            <div className="card-actions">
              <button className="chart-btn active">Order</button>
              <button className="chart-btn">Income Growth</button>
              <select className="chart-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="chart-placeholder">
            <p>Chart visualization will be implemented here</p>
          </div>
        </div>

        <div className="dashboard-card products-card">
          <h3>Most Selling Products</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : mostSellingProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No sales data available</div>
          ) : (
            <div className="products-list">
              {mostSellingProducts.map((product, index) => (
                <div key={product.productId} className="product-item">
                  <div className="product-icon">
                    {product.image ? (
                      <img src={product.image} alt={product.productName} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <Package className="w-6 h-6" />
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.productName}</div>
                    <div className="product-id">SKU: {product.sku}</div>
                  </div>
                  <div className="product-sales">{product.sales} Sales</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to={ROUTES.ADMIN_ORDERS} className="view-all-link">View All</Link>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent orders</div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.items[0]?.productName || 'N/A'}</td>
                      <td>{order.customer.name}</td>
                      <td>
                        <Link to={`${ROUTES.ADMIN_ORDERS}?order=${order._id}`} className="text-blue-600 hover:text-blue-800">
                          #{order.orderId}
                        </Link>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td><span className={`status-badge ${getStatusBadge(order.status)}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card customers-card">
          <h3>Weekly Top Customers</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : topCustomers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No customer data for this week</div>
          ) : (
            <div className="customers-list">
              {topCustomers.map((customer, index) => (
                <div key={customer.email} className="customer-item">
                  <div className="customer-avatar">{getInitials(customer.name)}</div>
                  <div className="customer-info">
                    <div className="customer-name">{customer.name}</div>
                    <div className="customer-orders">{customer.orderCount} Orders • {formatPrice(customer.totalSpent)}</div>
                  </div>
                  <button className="view-btn">View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

