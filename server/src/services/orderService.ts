import { Request } from 'express';
import { Order, IOrder, IOrderTimelineEvent } from '../models/orderModel';
import { AuthenticatedRequest } from '../middleware/middleware';
import { Product } from '../models/productModel';
import mongoose from 'mongoose';

export class OrderService {
  // Create a new order
  public async createOrder(req: AuthenticatedRequest) {
    try {
      const data = req.body;
      const user = req.user;

      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create timeline event for order placed
      const timeline: IOrderTimelineEvent[] = [{
        type: 'placed',
        title: 'Order Placed',
        description: `Order placed by ${data.customer.name}`,
        timestamp: new Date(),
        performedBy: data.customer.name,
      }];

      // If payment is paid, add payment event
      if (data.payment.status === 'paid') {
        timeline.push({
          type: 'payment',
          title: 'Payment Received',
          description: `Payment received via ${data.payment.method}`,
          timestamp: new Date(),
          performedBy: 'System',
        });
      }

      const orderData: Partial<IOrder> = {
        orderId,
        customer: {
          userId: user?.userId ? new mongoose.Types.ObjectId(user.userId) : undefined,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
        },
        items: data.items.map((item: any) => ({
          productId: new mongoose.Types.ObjectId(item.productId),
          productName: item.productName,
          productSku: item.productSku,
          variantName: item.variantName,
          variantSku: item.variantSku,
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          attributes: item.attributes,
        })),
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        payment: {
          method: data.payment.method,
          status: data.payment.status,
          transactionId: data.payment.transactionId,
          paidAt: data.payment.status === 'paid' ? new Date() : undefined,
        },
        shipping: {
          method: data.shipping.method,
          carrier: data.shipping.carrier,
          estimatedDelivery: data.shipping.estimatedDelivery ? new Date(data.shipping.estimatedDelivery) : undefined,
        },
        status: 'pending',
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        timeline,
      };

      const order = new Order(orderData);
      await order.save();

      return {
        order: await Order.findById(order._id).populate('items.productId', 'name images'),
        message: 'Order created successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create order');
    }
  }

  // Get all orders with filters
  public async getAllOrders(req: Request) {
    try {
      const {
        status,
        paymentStatus,
        dateRange,
        startDate,
        endDate,
        search,
        highPriority,
        newOrders,
        delayedShipments,
        page = 1,
        limit = 25,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const query: any = {};

      // Status filter
      if (status && status !== 'all') {
        query.status = status;
      }

      // Payment status filter
      if (paymentStatus && paymentStatus !== 'all') {
        query['payment.status'] = paymentStatus;
      }

      // Date range filter
      if (dateRange) {
        const now = new Date();
        let start: Date;
        switch (dateRange) {
          case 'today':
            start = new Date(now.setHours(0, 0, 0, 0));
            query.createdAt = { $gte: start };
            break;
          case 'yesterday':
            start = new Date(now);
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
            break;
          case 'last7days':
            start = new Date(now);
            start.setDate(start.getDate() - 7);
            query.createdAt = { $gte: start };
            break;
          case 'last30days':
            start = new Date(now);
            start.setDate(start.getDate() - 30);
            query.createdAt = { $gte: start };
            break;
          case 'thismonth':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            query.createdAt = { $gte: start };
            break;
          case 'lastmonth':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: lastMonthEnd };
            break;
          case 'custom':
            if (startDate && endDate) {
              query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
              };
            }
            break;
        }
      }

      // Search filter
      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } },
        ];
      }

      // Priority filter
      if (highPriority === 'true') {
        query.isHighPriority = true;
      }

      // Build sort
      const sort: any = {};
      if (sortBy === 'orderId') {
        sort.orderId = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'date') {
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'customer') {
        sort['customer.name'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'total') {
        sort.total = sortOrder === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1;
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // Execute query
      const orders = await Order.find(query)
        .populate('items.productId', 'name images')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Order.countDocuments(query);

      // Calculate statistics
      const allOrders = await Order.find({}).lean();
      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length;
      const completedOrders = allOrders.filter((o: any) => o.status === 'delivered').length;
      const totalRevenue = allOrders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      return {
        orders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        statistics: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue,
        },
        message: 'Orders fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch orders');
    }
  }

  // Get order by ID
  public async getOrderById(req: Request) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('items.productId', 'name images sku')
        .lean();

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        order,
        message: 'Order fetched successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch order');
    }
  }

  // Update order
  public async updateOrder(req: AuthenticatedRequest) {
    try {
      const { id } = req.params;
      const data = req.body;

      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      const previousStatus = order.status;
      const newStatus = data.status;

      // Update fields
      if (data.status) {
        order.status = data.status;
        
        // Handle stock management based on status change
        // Only decrement stock when status changes TO delivered (not if already delivered)
        if (newStatus === 'delivered' && previousStatus !== 'delivered') {
          // Decrement stock when order is delivered
          await this.decrementStock(order);
          // Set delivered date
          if (!order.shipping.deliveredAt) {
            order.shipping.deliveredAt = new Date();
          }
        } 
        // Restore stock if order is cancelled or refunded (only if it was previously delivered)
        else if ((newStatus === 'cancelled' || newStatus === 'refunded') && 
                 previousStatus === 'delivered') {
          // Restore stock if order is cancelled or refunded after being delivered
          await this.restoreStock(order);
        }

        // Add timeline event for status change
        if (!order.timeline) {
          order.timeline = [];
        }
        order.timeline.push({
          type: 'status_change',
          title: `Status changed to ${data.status}`,
          timestamp: new Date(),
          performedBy: req.user?.email || 'Admin',
        });
      }

      if (data.payment) {
        order.payment = { ...order.payment, ...data.payment };
      }

      if (data.shipping) {
        order.shipping = { ...order.shipping, ...data.shipping };
      }

      await order.save();

      return {
        order: await Order.findById(id).populate('items.productId', 'name images'),
        message: 'Order updated successfully',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update order');
    }
  }

  // Decrement product stock when order is delivered
  private async decrementStock(order: IOrder) {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      if (product.productType === 'simple') {
        // Simple product: decrement main stock
        if (product.trackInventory && product.stock !== undefined) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      } else if (product.productType === 'variant' && product.variants && item.variantSku) {
        // Variant product: find and decrement variant stock
        const variant = product.variants.find((v: any) => v.sku === item.variantSku);
        if (variant && variant.stock !== undefined) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          await product.save();
        }
      }
    }
  }

  // Restore product stock when order is cancelled or refunded
  private async restoreStock(order: IOrder) {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      if (product.productType === 'simple') {
        // Simple product: restore main stock
        if (product.trackInventory && product.stock !== undefined) {
          product.stock = (product.stock || 0) + item.quantity;
          await product.save();
        }
      } else if (product.productType === 'variant' && product.variants && item.variantSku) {
        // Variant product: find and restore variant stock
        const variant = product.variants.find((v: any) => v.sku === item.variantSku);
        if (variant && variant.stock !== undefined) {
          variant.stock = (variant.stock || 0) + item.quantity;
          await product.save();
        }
      }
    }
  }
}

