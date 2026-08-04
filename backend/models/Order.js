const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    returnedQuantity: { type: Number, default: 0 }
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  razorpaySignature: { type: String },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  codFee: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'placed' },
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: { type: String, default: '' },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }],
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'partial'], default: 'none' },
    requestedAt: Date,
    resolvedAt: Date
  },
  refund: {
    amount: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    refundedAt: Date,
    status: { type: String, enum: ['none', 'pending', 'completed'], default: 'none' }
  },
  shiprocketOrderId: { type: String },
  shiprocketShipmentId: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  manifestUrl: { type: String },
  labelUrl: { type: String },
  invoiceUrl: { type: String },
  trackingUrl: { type: String },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
