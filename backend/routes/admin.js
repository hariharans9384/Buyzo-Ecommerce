const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const { sendOrderEmail } = require('../services/emailService');
const shiprocketService = require('../services/shiprocketService');

const router = express.Router();

// Dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingReturns = await Order.countDocuments({ 'returnRequest.status': 'pending' });
    const pendingRefunds = await Order.countDocuments({ 'refund.status': 'pending' });
    const totalRefunded = await Order.aggregate([
      { $match: { 'refund.status': { $in: ['pending', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$refund.amount' } } }
    ]);
    const totalRefundAmount = totalRefunded[0]?.total || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top selling products
    const topProducts = await Product.find().sort({ totalSold: -1 }).limit(5);

    res.json({ totalProducts, totalUsers, totalOrders, totalRevenue, recentOrders, pendingReturns, pendingRefunds, totalRefundAmount, monthlySales, topProducts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (admin) — with full details
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone address')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (admin) — sends email + tracks history
router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, awbCode, courierName, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const oldStatus = order.orderStatus;

    // Manual tracking details update
    if (awbCode || courierName || trackingUrl) {
      if (awbCode && awbCode !== order.awbCode) {
        order.awbCode = awbCode;
        order.statusHistory.push({ status: 'info_update', note: `Tracking ID updated to: ${awbCode}` });
      }
      if (courierName) order.courierName = courierName;
      if (trackingUrl) order.trackingUrl = trackingUrl;
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;

      // Handle cancellation and refund
      if (orderStatus === 'cancelled' && oldStatus !== 'cancelled') {
        order.statusHistory.push({ status: 'cancelled', note: 'Order cancelled by admin' });

        // Initiate refund if the order was paid
        if (order.paymentStatus === 'paid') {
          order.paymentStatus = 'refunded';
          order.refund = {
            amount: order.totalAmount,
            reason: 'Order cancelled by admin',
            refundedAt: new Date(),
            status: 'pending'
          };
          order.statusHistory.push({ status: 'refund_initiated', note: 'Automatic refund initiated due to admin cancellation' });
        }

        // Restock products
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
        }
      } else {
        order.statusHistory.push({ status: orderStatus, note: `Status updated to ${orderStatus} by admin` });
      }
    }

    if (orderStatus === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    } else if (paymentStatus && !order.refund?.amount) {
      // Only update paymentStatus from body if a refund hasn't just been initiated
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    if (orderStatus === 'shipped' && order.user?.email) {
      sendOrderEmail(order.user.email, `Order Shipped — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'shipped');
    } else if (orderStatus === 'delivered' && order.user?.email) {
      sendOrderEmail(order.user.email, `Order Delivered — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'delivered');
    } else if (orderStatus === 'cancelled' && order.user?.email) {
      sendOrderEmail(order.user.email, `Order Cancelled — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'cancelled');
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Handle return request (admin approve/reject)
router.put('/orders/:id/return', adminAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.returnRequest.requested || order.returnRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending return request for this order' });
    }

    if (action === 'approve') {
      let isPartial = false;
      let refundAmount = order.totalAmount;
      let itemsToRestock = order.items;

      if (order.returnRequest.items && order.returnRequest.items.length > 0) {
        refundAmount = order.returnRequest.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        itemsToRestock = order.returnRequest.items;

        if (order.returnRequest.items.length < order.items.length) {
          isPartial = true;
        } else {
          for (const rItem of order.returnRequest.items) {
            const oItem = order.items.find(i => i.product.toString() === rItem.product.toString());
            if (oItem && rItem.quantity < oItem.quantity) {
              isPartial = true; break;
            }
          }
        }
      }

      order.returnRequest.status = 'approved';
      order.returnRequest.resolvedAt = new Date();
      order.orderStatus = isPartial ? 'delivered' : 'returned'; // Keep delivered if partial
      if (!isPartial) order.paymentStatus = 'refunded';

      const previousRefundAmount = order.refund?.amount || 0;
      order.refund = {
        amount: previousRefundAmount + refundAmount, // Accumulate!
        reason: `${isPartial ? 'Partial' : 'Full'} return approved: ${order.returnRequest.reason}`,
        refundedAt: new Date(),
        status: 'pending' // Usually 'pending' means admin needs to initiate via payment gateway
      };

      order.statusHistory.push({ status: isPartial ? 'partial_return' : 'returned', note: `${isPartial ? 'Partial' : 'Full'} return approved by admin - refund of ₹${refundAmount} initiated` });

      // Restock returned items & update returnedQuantity inside order
      for (const item of itemsToRestock) {
        // Find the item in order.items and increment returnedQuantity
        const oItem = order.items.find(i => i.product.toString() === item.product.toString());
        if (oItem) oItem.returnedQuantity = (oItem.returnedQuantity || 0) + item.quantity;

        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
      }
    } else if (action === 'reject') {
      order.returnRequest.status = 'rejected';
      order.returnRequest.resolvedAt = new Date();
      order.statusHistory.push({ status: 'return_rejected', note: `Return request rejected by admin` });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
    }

    await order.save();
    res.json({ message: `Return request ${action}d successfully`, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark refund as completed (admin)
router.put('/orders/:id/refund-complete', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.refund || order.refund.status !== 'pending') return res.status(400).json({ message: 'No pending refund' });

    order.refund.status = 'completed';
    order.refund.refundedAt = new Date();
    order.statusHistory.push({ status: 'refund_completed', note: `Refund of ₹${order.refund.amount} completed by admin` });
    await order.save();
    res.json({ message: 'Refund marked as completed', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── Shiprocket Admin Endpoints ─────────────────────────────────────────────

// 1. Assign AWB (auto-selects courier)
router.post('/orders/:id/shiprocket/awb', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.shiprocketShipmentId) return res.status(400).json({ message: 'Order not yet pushed to Shiprocket. Shipment ID missing.' });
    if (order.awbCode) return res.json({ message: 'AWB already assigned', order });

    const result = await shiprocketService.assignAWB(order.shiprocketShipmentId);
    const data = result.response?.data || {};

    if (!data.awb_code) return res.status(400).json({ message: 'AWB assignment failed', detail: result });

    order.awbCode = data.awb_code;
    order.courierName = data.courier_name || 'Unknown';
    order.orderStatus = 'shipped';
    order.statusHistory.push({ status: 'shipped', note: `AWB: ${data.awb_code} via ${data.courier_name}` });
    await order.save();

    // notify user via email
    try {
      await order.populate('user', 'email name');
      if (order.user?.email) sendOrderEmail(order.user.email, `Order Shipped — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'shipped');
    } catch (_) {}

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Shiprocket AWB Error', error: error.message });
  }
});

// 2. Generate Pickup
router.post('/orders/:id/shiprocket/pickup', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.shiprocketShipmentId) return res.status(400).json({ message: 'Shipment ID missing' });
    const result = await shiprocketService.generatePickup(order.shiprocketShipmentId);
    res.json({ message: 'Pickup scheduled', result });
  } catch (error) {
    res.status(500).json({ message: 'Pickup Error', error: error.message });
  }
});

// 3. Generate & Print Manifest
router.post('/orders/:id/shiprocket/manifest', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.shiprocketShipmentId) return res.status(400).json({ message: 'Shipment ID missing' });

    await shiprocketService.generateManifest(order.shiprocketShipmentId);
    const printResult = await shiprocketService.printManifest(order.shiprocketOrderId);

    if (printResult.manifest_url) {
      order.manifestUrl = printResult.manifest_url;
      await order.save();
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Manifest Error', error: error.message });
  }
});

// 4. Generate Label
router.post('/orders/:id/shiprocket/label', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.shiprocketShipmentId) return res.status(400).json({ message: 'Shipment ID missing' });

    const result = await shiprocketService.generateLabel(order.shiprocketShipmentId);
    if (result.label_url) {
      order.labelUrl = result.label_url;
      await order.save();
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Label Error', error: error.message });
  }
});

// 5. Print Invoice
router.post('/orders/:id/shiprocket/invoice', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.shiprocketOrderId) return res.status(400).json({ message: 'Shiprocket Order ID missing' });

    const result = await shiprocketService.printInvoice(order.shiprocketOrderId);
    if (result.invoice_url) {
      order.invoiceUrl = result.invoice_url;
      await order.save();
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Invoice Error', error: error.message });
  }
});

// 6. Track by AWB
router.get('/orders/:id/shiprocket/track', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.awbCode) return res.status(400).json({ message: 'AWB code not found on order' });
    const result = await shiprocketService.trackAWB(order.awbCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Tracking Error', error: error.message });
  }
});

module.exports = router;
