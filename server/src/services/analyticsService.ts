import { Order } from '../models/orderModel';
import { Product } from '../models/productModel';
import mongoose from 'mongoose';

export class AnalyticsService {
  // Get most selling products
  public async getMostSellingProducts(limit: number = 10) {
    try {
      // Get all delivered orders
      const orders = await Order.find({ status: 'delivered' }).lean();

      // Aggregate product sales
      const productSales: { [key: string]: { productId: string; productName: string; sales: number; image?: string } } = {};

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const productId = item.productId instanceof mongoose.Types.ObjectId 
            ? item.productId.toString() 
            : String(item.productId);
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              productName: item.productName,
              sales: 0,
              image: item.image,
            };
          }
          productSales[productId].sales += item.quantity;
        });
      });

      // Convert to array and sort by sales
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);

      // Fetch product details for images
      const productIds = topProducts.map(p => new mongoose.Types.ObjectId(p.productId));
      const products = await Product.find({ _id: { $in: productIds } }).select('name sku images').lean();

      // Map product details
      const productsWithDetails = topProducts.map((product) => {
        const productDetail = products.find(p => p._id.toString() === product.productId);
        return {
          productId: product.productId,
          productName: product.productName,
          sku: productDetail?.sku || 'N/A',
          sales: product.sales,
          image: product.image || productDetail?.images?.[0]?.url || 'https://via.placeholder.com/50x50?text=Product',
        };
      });

      return {
        products: productsWithDetails,
        message: 'Most selling products fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch most selling products');
    }
  }

  // Get recent orders
  public async getRecentOrders(limit: number = 5) {
    try {
      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('items.productId', 'name images')
        .lean();

      return {
        orders,
        message: 'Recent orders fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch recent orders');
    }
  }

  // Get weekly top customers
  public async getWeeklyTopCustomers(limit: number = 10) {
    try {
      // Get date range for last week
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get orders from last week
      const orders = await Order.find({
        createdAt: { $gte: weekAgo },
      }).lean();

      // Aggregate customer orders
      const customerOrders: { [key: string]: { email: string; name: string; orderCount: number; totalSpent: number } } = {};

      orders.forEach((order) => {
        const email = order.customer.email;
        if (!customerOrders[email]) {
          customerOrders[email] = {
            email,
            name: order.customer.name,
            orderCount: 0,
            totalSpent: 0,
          };
        }
        customerOrders[email].orderCount += 1;
        customerOrders[email].totalSpent += order.total;
      });

      // Convert to array and sort by order count
      const topCustomers = Object.values(customerOrders)
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, limit);

      return {
        customers: topCustomers,
        message: 'Weekly top customers fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch weekly top customers');
    }
  }

  // Get dashboard statistics
  public async getDashboardStats() {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total revenue
      const allOrders = await Order.find({ status: 'delivered' }).lean();
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Revenue from last month
      const lastMonthOrders = allOrders.filter(
        (order) => new Date(order.createdAt) >= monthAgo
      );
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // New customers (unique emails from last week)
      const recentOrders = await Order.find({ createdAt: { $gte: weekAgo } }).lean();
      const uniqueCustomers = new Set(recentOrders.map(order => order.customer.email));
      const newCustomers = uniqueCustomers.size;

      // Total customers
      const allUniqueCustomers = new Set(allOrders.map(order => order.customer.email));
      const totalCustomers = allUniqueCustomers.size;

      // Average order value
      const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

      // Repeat purchase rate
      const customerOrderCounts: { [key: string]: number } = {};
      allOrders.forEach((order) => {
        const email = order.customer.email;
        customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
      });
      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      return {
        totalRevenue,
        lastMonthRevenue,
        newCustomers,
        totalCustomers,
        avgOrderValue,
        repeatPurchaseRate,
        totalOrders: allOrders.length,
        message: 'Dashboard statistics fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch dashboard statistics');
    }
  }
}

