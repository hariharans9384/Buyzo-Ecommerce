const sendEmail = require('../utils/sendEmail');

const sendOrderEmail = async (to, subject, order, type = 'placed') => {
  const statusMessages = {
    placed: { title: '🎉 Order Confirmed!', color: '#6366f1', message: 'Your order has been successfully placed.' },
    shipped: { title: '🚚 Order Shipped!', color: '#f59e0b', message: 'Your order is on its way!' },
    delivered: { title: '✅ Order Delivered!', color: '#10b981', message: 'Your order has been delivered successfully.' },
    cancelled: { title: '❌ Order Cancelled', color: '#ef4444', message: 'Your order has been cancelled.' },
    returned: { title: '🔄 Return Approved', color: '#f59e0b', message: 'Your return request has been approved.' }
  };

  const info = statusMessages[type] || statusMessages.placed;

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 15px 12px; border-bottom: 1px solid #f3f4f6;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.image || item.product?.image ? `<img src="${item.image || item.product?.image}" alt="" width="50" height="50" style="border-radius: 8px; object-fit: cover; border: 1px solid #e5e7eb;" />` : ''}
          <div style="font-size: 14px; font-weight: 500; color: #111827;">${item.name || item.product?.name}</div>
        </div>
      </td>
      <td style="padding: 15px 12px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #4b5563; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 15px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #4b5563; font-size: 14px;">₹${item.price?.toLocaleString()}</td>
      <td style="padding: 15px 12px; border-bottom: 1px solid #f3f4f6; text-align: right; color: #111827; font-size: 14px; font-weight: 600;">₹${(item.price * item.quantity)?.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: ${info.color}; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${info.title}</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${info.message}</p>
      </div>
      
      <div style="padding: 30px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order ID: <strong style="color: #111827;">#${order._id?.toString().slice(-8).toUpperCase()}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
              <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="margin-top: 30px; text-align: right; border-top: 2px solid #f3f4f6; padding-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Subtotal: <span style="color: #4b5563; font-weight: 500;">₹${order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString()}</span></p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Shipping: <span style="color: #10b981; font-weight: 600;">FREE</span></p>
          ${order.paymentMethod === 'cod' ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">COD Fee: <span style="color: #f59e0b; font-weight: 600;">₹${(order.codFee || 25).toLocaleString()}</span></p>` : ''}
          <p style="margin: 15px 0 0 0; font-size: 24px; font-weight: 700; color: #111827;">Total: ₹${order.totalAmount?.toLocaleString()}</p>
        </div>

        ${order.shippingAddress ? `
        <div style="margin-top: 35px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
          <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #374151;">Shipping Address:</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: 40px;">
          <a href="${process.env.MAIN_URL}/orders" style="display: inline-block; background-color: ${info.color}; color: #ffffff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">View Order Details</a>
        </div>

        <div style="border-top: 1px solid #f3f4f6; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Team Dudez_Shop</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #9ca3af;">Premium Shopping Experience</p>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Dudez_Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html });
    console.log(`📧 Email sent: ${type} → ${to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

module.exports = { sendOrderEmail };
