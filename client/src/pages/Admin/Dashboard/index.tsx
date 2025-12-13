import React from 'react';
import './Dashboard.css';

const AdminDashboard: React.FC = () => {
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
            <span className="kpi-trend positive">↑ 14.9%</span>
          </div>
          <div className="kpi-value">$245,450</div>
          <div className="kpi-change positive">+43.21%</div>
        </div>

        <div className="kpi-card customers">
          <div className="kpi-header">
            <span className="kpi-label">New Customers</span>
            <span className="kpi-trend negative">↓ 8.6%</span>
          </div>
          <div className="kpi-value">684</div>
          <div className="kpi-change negative">-8.6%</div>
        </div>

        <div className="kpi-card repeat">
          <div className="kpi-header">
            <span className="kpi-label">Repeat Purchase Rate</span>
            <span className="kpi-trend positive">↑ 25.4%</span>
          </div>
          <div className="kpi-value">75.12%</div>
          <div className="kpi-change positive">+20.11%</div>
        </div>

        <div className="kpi-card aov">
          <div className="kpi-header">
            <span className="kpi-label">Average Order Value</span>
            <span className="kpi-trend positive">↑ 35.2%</span>
          </div>
          <div className="kpi-value">$2,412.23</div>
          <div className="kpi-change positive">+$754</div>
        </div>

        <div className="kpi-card conversion">
          <div className="kpi-header">
            <span className="kpi-label">Conversion rate</span>
            <span className="kpi-trend negative">↓ 12.42%</span>
          </div>
          <div className="kpi-value">32.65%</div>
          <div className="kpi-change negative">-12.42%</div>
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
          <div className="products-list">
            <div className="product-item">
              <div className="product-icon">👟</div>
              <div className="product-info">
                <div className="product-name">Snicker Vento</div>
                <div className="product-id">ID: 2441310</div>
              </div>
              <div className="product-sales">128 Sales</div>
            </div>
            <div className="product-item">
              <div className="product-icon">🎒</div>
              <div className="product-info">
                <div className="product-name">Blue Backpack</div>
                <div className="product-id">ID: 1241318</div>
              </div>
              <div className="product-sales">401 Sales</div>
            </div>
            <div className="product-item">
              <div className="product-icon">🍼</div>
              <div className="product-info">
                <div className="product-name">Water Bottle</div>
                <div className="product-id">ID: 8441573</div>
              </div>
              <div className="product-sales">1K+ Sales</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all-link">View All</button>
          </div>
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
                <tr>
                  <td>Water Bottle</td>
                  <td>Peterson Jack</td>
                  <td>#8441373</td>
                  <td>27 Jun 2025</td>
                  <td><span className="status-badge pending">Pending</span></td>
                </tr>
                <tr>
                  <td>Iphone 15 Pro</td>
                  <td>Michel Datta</td>
                  <td>#2457841</td>
                  <td>26 Jun 2025</td>
                  <td><span className="status-badge canceled">Canceled</span></td>
                </tr>
                <tr>
                  <td>Headphone</td>
                  <td>Jesiya Rose</td>
                  <td>#1024784</td>
                  <td>20 Jun 2025</td>
                  <td><span className="status-badge shipped">Shipped</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card customers-card">
          <h3>Weekly Top Customers</h3>
          <div className="customers-list">
            <div className="customer-item">
              <div className="customer-avatar">MH</div>
              <div className="customer-info">
                <div className="customer-name">Marks Hoverson</div>
                <div className="customer-orders">25 Orders</div>
              </div>
              <button className="view-btn">View</button>
            </div>
            <div className="customer-item">
              <div className="customer-avatar">MH</div>
              <div className="customer-info">
                <div className="customer-name">Marks Hoverson</div>
                <div className="customer-orders">15 Orders</div>
              </div>
              <button className="view-btn">View</button>
            </div>
            <div className="customer-item">
              <div className="customer-avatar">JP</div>
              <div className="customer-info">
                <div className="customer-name">Jhony Peters</div>
                <div className="customer-orders">23 Orders</div>
              </div>
              <button className="view-btn">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

