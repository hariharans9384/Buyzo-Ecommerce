// backend/services/shiprocketService.js
const axios = require('axios');

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let tokenCache = null;
let tokenExpiry = null;

const getAuthToken = async () => {
  if (tokenCache && tokenExpiry && Date.now() < tokenExpiry) {
    return tokenCache;
  }
  try {
    const email = process.env.SHIPEMAIL || process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPPASSWORD || process.env.SHIPROCKET_PASSWORD;
    if (!email || !password) throw new Error('Shiprocket credentials missing in .env (SHIPEMAIL / SHIPPASSWORD)');

    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    tokenCache = res.data.token;
    // Token valid for 240 hours; refresh after 9 days to be safe
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    console.log('Shiprocket auth token refreshed');
    return tokenCache;
  } catch (err) {
    console.error('Shiprocket Auth Error:', err.response?.data || err.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

const getHeaders = async () => {
  const token = await getAuthToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// Create Adhoc Order on Shiprocket
const createAdhocOrder = async (order, user) => {
  try {
    const headers = await getHeaders();

    const orderItems = (order.items || []).map(item => ({
      name: item.name || 'Product',
      sku: (item.product || item._id || 'SKU').toString(),
      units: item.quantity || 1,
      selling_price: item.price || 0,
      length: 10,
      width: 10,
      height: 10,
      weight: 0.5
    }));

    const addr = order.shippingAddress || {};
    const payload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: (user && user.name) ? user.name : 'Customer',
      billing_last_name: '',
      billing_address: addr.street || 'N/A',
      billing_city: addr.city || 'N/A',
      billing_pincode: addr.zipCode || '600001',
      billing_state: addr.state || 'Tamil Nadu',
      billing_country: addr.country || 'India',
      billing_email: (user && user.email) ? user.email : 'customer@dudezshop.com',
      billing_phone: addr.phone || (user && user.phone) || '9999999999',
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: order.totalAmount || 0,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    const res = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, { headers });
    console.log('Shiprocket order created:', res.data.order_id);
    return res.data; // { order_id, shipment_id, status, status_code }
  } catch (error) {
    console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
    throw new Error('Failed to create Shiprocket order');
  }
};

// Assign AWB Code & Courier
const assignAWB = async (shipmentId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/courier/assign/awb`, { shipment_id: shipmentId }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket AWB Error:', error.response?.data || error.message);
    throw new Error('Failed to assign AWB');
  }
};

// Generate Pickup Request
const generatePickup = async (shipmentId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/courier/generate/pickup`, { shipment_id: [shipmentId] }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Pickup Error:', error.response?.data || error.message);
    throw new Error('Failed to generate pickup');
  }
};

// Generate Manifest
const generateManifest = async (shipmentId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/manifests/generate`, { shipment_id: [shipmentId] }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Manifest Generate Error:', error.response?.data || error.message);
    throw new Error('Failed to generate manifest');
  }
};

// Print Manifest (get PDF URL)
const printManifest = async (orderId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/manifests/print`, { order_ids: [orderId] }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Print Manifest Error:', error.response?.data || error.message);
    throw new Error('Failed to print manifest');
  }
};

// Generate Label (get PDF URL)
const generateLabel = async (shipmentId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/courier/generate/label`, { shipment_id: [shipmentId] }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Label Error:', error.response?.data || error.message);
    throw new Error('Failed to generate label');
  }
};

// Print Invoice (get PDF URL)
const printInvoice = async (orderId) => {
  try {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/orders/print/invoice`, { ids: [orderId] }, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Invoice Error:', error.response?.data || error.message);
    throw new Error('Failed to print invoice');
  }
};

// Track by AWB Code
const trackAWB = async (awbCode) => {
  try {
    const headers = await getHeaders();
    const res = await axios.get(`${BASE_URL}/courier/track/awb/${awbCode}`, { headers });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Track Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch tracking data');
  }
};

module.exports = {
  createAdhocOrder,
  assignAWB,
  generatePickup,
  generateManifest,
  printManifest,
  generateLabel,
  printInvoice,
  trackAWB
};
