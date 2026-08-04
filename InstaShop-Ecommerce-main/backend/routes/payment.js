const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderEmail } = require('../services/emailService');
const shiprocketService = require('../services/shiprocketService');

const router = express.Router();

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Create Razorpay order AND a pending DB order (so the order exists even if user refreshes)
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, items, shippingAddress } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount is required' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'Items are required' });

    // 1. Create Razorpay order
    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: { userId: req.user._id.toString() }
    };
    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Validate products and reduce stock
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

      product.stock -= item.quantity;
      product.totalSold = (product.totalSold || 0) + item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: product.price
      });
    }

    // 3. Create the DB order with paymentStatus = 'pending'
    const totalAmount = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const dbOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {},
      razorpayOrderId: razorpayOrder.id,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      orderStatus: 'placed',
      statusHistory: [{ status: 'placed', note: 'Order placed — awaiting payment' }]
    });
    await dbOrder.save();

    // Clear cart now — order is saved. Even if frontend clearCart() runs again later, it's safe.
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      orderId: razorpayOrder.id,
      dbOrderId: dbOrder._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('[create-order] Error:', error.message);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// Verify payment signature and update the pending order to 'paid'
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ verified: false, message: 'Payment verification failed' });
    }

    // Update the pending order to paid
    const order = await Order.findOne({ _id: dbOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'paid';
    order.statusHistory.push({ status: 'paid', note: 'Payment received successfully' });

    // Push to Shiprocket for paid online orders
    if (!order.shiprocketOrderId) {
      try {
        const user = await User.findById(req.user._id);
        const srRes = await shiprocketService.createAdhocOrder(order, user);
        if (srRes && srRes.order_id) {
          order.shiprocketOrderId = String(srRes.order_id);
          order.shiprocketShipmentId = String(srRes.shipment_id);
        }
      } catch (srErr) {
        console.error('Shiprocket push failed (verify):', srErr.message);
      }
    }
    await order.save();

    // Also clear cart here as a safety net
    await Cart.findOneAndDelete({ user: req.user._id });

    // Send confirmation email
    try {
      const user = await User.findById(req.user._id);
      if (user?.email) {
        sendOrderEmail(user.email, `Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'placed');
      }
    } catch (emailErr) {
      console.error('Failed to send order email:', emailErr.message);
    }

    res.json({ verified: true, paymentId: razorpay_payment_id, order });
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});

// Mark an existing pending order as failed (called when Razorpay fires payment.failed)
router.post('/failed', auth, async (req, res) => {
  try {
    const { dbOrderId, errorDescription, errorCode } = req.body;

    if (dbOrderId) {
      // Update existing pending order to failed
      const order = await Order.findOne({ _id: dbOrderId, user: req.user._id });
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        order.orderStatus = 'cancelled';
        order.statusHistory.push({
          status: 'cancelled',
          note: `Payment failed: ${errorDescription || errorCode || 'Unknown error'}`
        });

        // Restore stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity, totalSold: -item.quantity }
          });
        }

        await order.save();
        return res.json({ message: 'Order marked as failed', order });
      }
    }

    res.status(400).json({ message: 'No valid pending order to update' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording failed payment', error: error.message });
  }
});

// Retry payment for an existing pending order (called from Orders page "Complete Payment" button)
router.post('/retry-order/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: `Cannot retry — order payment status is "${order.paymentStatus}"` });
    }

    // Create a fresh Razorpay order for the same amount
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `retry_${Date.now()}`,
      notes: { userId: req.user._id.toString(), dbOrderId: order._id.toString() }
    });

    // Update the DB order's razorpayOrderId to the new one
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      dbOrderId: order._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create retry payment order', error: error.message });
  }
});

// Webhook to handle Razorpay server-to-server events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET; // Ensure you have a webhook secret
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;

    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;

      // Find the pending order
      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus === 'pending') {
        order.paymentId = paymentData.id;
        order.paymentStatus = 'paid';
        order.statusHistory.push({ status: 'paid', note: 'Payment received via webhook' });

        // Push to Shiprocket if not already created
        if (!order.shiprocketOrderId) {
          try {
            const user = await User.findById(order.user);
            const srRes = await shiprocketService.createAdhocOrder(order, user);
            if (srRes && srRes.order_id) {
              order.shiprocketOrderId = String(srRes.order_id);
              order.shiprocketShipmentId = String(srRes.shipment_id);
            }
          } catch (srErr) {
            console.error('Shiprocket push failed (webhook):', srErr.message);
          }
        }
        await order.save();

        // Clear cart for the user
        await Cart.findOneAndDelete({ user: order.user });

        // Send email
        try {
          const user = await User.findById(order.user);
          if (user?.email) {
            sendOrderEmail(user.email, `Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'placed');
          }
        } catch (emailErr) {
          console.error('Webhook email error:', emailErr.message);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook failed' });
  }
});

module.exports = router;
