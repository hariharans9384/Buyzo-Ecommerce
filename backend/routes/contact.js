const express = require('express');
const Contact = require('../models/Contact');
const { adminAuth } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Submit contact form (public — no auth needed)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    // Send confirmation email to customer
    try {
      await sendEmail({
        to: email,
        subject: `Dudez_Shop - We received your message: ${subject}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Thanks for reaching out!</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">We've received your message and will get back to you soon.</p>
            </div>
            <div style="padding: 40px; background-color: #ffffff;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.5;">Hi ${name},</p>
              <p style="margin: 0 0 25px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">Thank you for contacting Dudez_Shop support. We've successfully received your inquiry regarding <b></b>"${subject}"</b>.</p>
              
              <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Your Message Preview:</p>
                <p style="margin: 0; font-size: 15px; color: #4b5563; font-style: italic; line-height: 1.6;">"${message}"</p>
              </div>
              
              <p style="margin: 0 0 25px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">Our team typically responds within 24 hours. In the meantime, feel free to browse our latest collections.</p>
              
              <div style="border-top: 1px solid #f3f4f6; padding-top: 30px; margin-top: 40px; text-align: center;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Team Dudez_Shop</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #9ca3af;">Premium Shopping Experience</p>
              </div>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 Dudez_Shop. All rights reserved.</p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Customer email failed:', emailErr.message);
    }

    // Send alert email to admin
    try {
      await sendEmail({
        to: process.env.EMAIL,
        subject: `📬 Dudez_Shop Admin: New Message from ${name}`,
        fromName: 'Dudez_Shop Admin System',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #d97706; padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📬 New Contact Message</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
              <div style="margin-bottom: 25px;">
                <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600; text-transform: uppercase;">From User:</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; color: #1f2937;"><b>${name}</b> (${email})</p>
              </div>

              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fde68a; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #92400e;">SUBJECT: ${subject}</p>
                <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.6;">${message}</p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">Received at ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Admin email failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});

// Get all contacts (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update contact status (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete contact (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
