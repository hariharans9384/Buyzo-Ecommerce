const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { sendOrderEmail } = require('../services/emailService');
const shiprocketService = require('../services/shiprocketService');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentId, razorpayOrderId, razorpaySignature, paymentMethod, codFee } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

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

    const orderSubtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = orderSubtotal + (codFee || 0);

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: finalTotal,
      shippingAddress,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
      paymentMethod: paymentMethod || 'online',
      codFee: codFee || 0,
      paymentStatus: paymentId ? 'paid' : 'pending',
      statusHistory: [{ status: 'placed', note: 'Order placed successfully' }]
    });

    await order.save();
    await Cart.findOneAndDelete({ user: req.user._id });

    const user = await User.findById(req.user._id);

    // Auto-push to Shiprocket for COD orders (online orders pushed after payment verify)
    if (order.paymentMethod === 'cod') {
      try {
        const srRes = await shiprocketService.createAdhocOrder(order, user);
        if (srRes && srRes.order_id) {
          order.shiprocketOrderId = String(srRes.order_id);
          order.shiprocketShipmentId = String(srRes.shipment_id);
          await order.save();
        }
      } catch (srErr) {
        console.error('Shiprocket COD order push failed:', srErr.message);
      }
    }

    if (user?.email) {
      sendOrderEmail(user.email, `Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`, order, 'placed');
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel order (only if status = placed)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'placed') {
      return res.status(400).json({ message: `Cannot cancel order with status "${order.orderStatus}". Only orders in "placed" status can be cancelled.` });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });

    // Refund if paid
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.refund = {
        amount: order.totalAmount,
        reason: 'Order cancelled by customer',
        refundedAt: new Date(),
        status: 'pending'
      };
    }

    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request return (only if delivered + within 7 days)
router.post('/:id/return', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'delivered') return res.status(400).json({ message: 'Only delivered orders can be returned.' });
    if (order.returnRequest.status === 'pending') return res.status(400).json({ message: 'A return request is already pending processing.' });

    const diffDays = Math.ceil((Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) return res.status(400).json({ message: 'Return window expired (7 days).' });

    // Handle partial returns
    let returnItems = [];
    if (req.body.items && req.body.items.length > 0) {
      // Validate requested items against original order vs already returned
      for (const reqItem of req.body.items) {
        const orderItem = order.items.find(i => i.product.toString() === reqItem.product.toString());
        if (!orderItem) return res.status(400).json({ message: `Item not found in order` });

        const availableToReturn = orderItem.quantity - (orderItem.returnedQuantity || 0);
        if (reqItem.quantity > availableToReturn || reqItem.quantity < 1) {
          return res.status(400).json({ message: `Invalid return quantity for ${orderItem.name}` });
        }

        returnItems.push({
          product: orderItem.product,
          quantity: reqItem.quantity,
          price: orderItem.price
        });
      }
    } else {
      // Default: Return all remaining items
      returnItems = order.items
        .filter(i => i.quantity > (i.returnedQuantity || 0))
        .map(i => ({
          product: i.product,
          quantity: i.quantity - (i.returnedQuantity || 0),
          price: i.price
        }));
      if (returnItems.length === 0) return res.status(400).json({ message: 'All items have already been returned.' });
    }

    order.returnRequest = {
      requested: true,
      reason: req.body.reason || 'No reason',
      status: 'pending',
      items: returnItems,
      requestedAt: new Date()
    };

    // Determine if it's a partial return (checking what's left vs total)
    let isPartial = false;
    let totalWillBeReturned = 0;
    let totalOrderItems = 0;
    for (const oi of order.items) {
      totalOrderItems += oi.quantity;
      const rItem = returnItems.find(r => r.product.toString() === oi.product.toString());
      totalWillBeReturned += (oi.returnedQuantity || 0) + (rItem ? rItem.quantity : 0);
    }
    if (totalWillBeReturned < totalOrderItems) isPartial = true;

    order.statusHistory.push({ status: 'return_requested', note: `Return requested: ${req.body.reason || 'No reason'} ${isPartial ? '(Partial)' : '(Full)'}` });
    await order.save();

    // Create admin notification
    try {
      const notification = new Notification({
        type: 'RETURN_REQUESTED',
        order: order._id,
        user: req.user._id,
        message: `New ${isPartial ? 'partial ' : ''}return request for Order #${order._id.toString().slice(-8).toUpperCase()} - ${req.body.reason || 'No reason'}`
      });
      await notification.save();
    } catch (notifyErr) {
      console.error('Failed to create notification:', notifyErr.message);
    }

    res.json({ message: 'Return request submitted', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download invoice PDF
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const user = await User.findById(req.user._id);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id.toString().slice(-8)}.pdf`);
    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').fillColor('#6C63FF').text('Dudez_Shop', 50, 40);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Premium Shopping', 50, 68);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#333').text('INVOICE', 400, 40, { align: 'right' });
    doc.fontSize(10).font('Helvetica').fillColor('#666').text(`#${order._id.toString().slice(-8).toUpperCase()}`, 400, 65, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 80, { align: 'right' });
    doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#eee').stroke();

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Bill To:', 50, 115);
    doc.fontSize(10).font('Helvetica').fillColor('#555');
    doc.text(user.name, 50, 132);
    doc.text(user.email, 50, 146);
    if (user.phone) doc.text(user.phone, 50, 160);

    if (order.shippingAddress) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Ship To:', 300, 115);
      doc.fontSize(10).font('Helvetica').fillColor('#555');
      if (order.shippingAddress.phone) doc.text(`Phone: ${order.shippingAddress.phone}`, 300, 132);
      doc.text(order.shippingAddress.street || '', 300, 146);
      doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.zipCode || ''}`, 300, 160);
    }

    const tableTop = 195;
    doc.rect(50, tableTop, 500, 25).fill('#6C63FF');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
    doc.text('Item', 60, tableTop + 7);
    doc.text('Qty', 340, tableTop + 7, { width: 50, align: 'center' });
    doc.text('Price', 400, tableTop + 7, { width: 70, align: 'right' });
    doc.text('Total', 480, tableTop + 7, { width: 60, align: 'right' });

    let y = tableTop + 30;
    order.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? '#f9fafb' : '#fff';
      doc.rect(50, y - 5, 500, 24).fill(bg);
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(item.name || item.product?.name || 'Product', 60, y, { width: 270 });
      doc.text(item.quantity.toString(), 340, y, { width: 50, align: 'center' });
      doc.text(`Rs.${item.price?.toLocaleString()}`, 400, y, { width: 70, align: 'right' });
      doc.text(`Rs.${(item.price * item.quantity)?.toLocaleString()}`, 480, y, { width: 60, align: 'right' });
      y += 24;
    });

    y += 10;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#eee').stroke();
    y += 12;

    // Subtotal
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Subtotal:', 400, y).text(`Rs.${subtotal.toLocaleString()}`, 480, y, { width: 60, align: 'right' });
    y += 18;

    // Shipping
    doc.text('Shipping:', 400, y).fillColor('#10B981').text('Free', 480, y, { width: 60, align: 'right' });
    y += 18;

    // COD/Online Fee
    if (order.paymentMethod === 'cod') {
      doc.fillColor('#666').text('COD Fee:', 400, y).text(`Rs.${(order.codFee || 25).toLocaleString()}`, 480, y, { width: 60, align: 'right' });
    } else {
      doc.fillColor('#666').text('Online Handling:', 400, y).text('Rs.0', 480, y, { width: 60, align: 'right' });
    }
    y += 24;

    // Total
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('Total:', 400, y).text(`Rs.${order.totalAmount?.toLocaleString()}`, 460, y, { width: 80, align: 'right' });

    if (order.refund?.status !== 'none' && order.refund?.amount) {
      y += 25;
      doc.fontSize(10).font('Helvetica').fillColor('#ef4444').text(`Refund: Rs.${order.refund.amount?.toLocaleString()} (${order.refund.status})`, 400, y, { width: 140, align: 'right' });
    }

    y += 50;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#eee').stroke();
    y += 12;
    doc.fontSize(9).font('Helvetica').fillColor('#999').text('Thank you for shopping with Dudez_Shop!', 50, y, { align: 'center', width: 500 });
    const displayPaymentStatus = (order.paymentMethod === 'cod' && order.orderStatus === 'delivered') ? 'paid' : order.paymentStatus;
    doc.text(`Payment: ${order.paymentMethod?.toUpperCase()} (${displayPaymentStatus}) | Status: ${order.orderStatus}`, 50, y + 14, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Invoice generation failed', error: error.message });
  }
});

module.exports = router;
