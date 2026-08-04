# 🛍️ Dudez_Shop — Premium E-commerce Ecosystem

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&style=for-the-badge)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19.0-blue?logo=react&style=for-the-badge)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&style=for-the-badge)](https://nodejs.org)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css&style=for-the-badge)](https://tailwindcss.com)

**Dudez_Shop** is a high-performance, full-stack e-commerce solution engineered for a premium shopping experience. Built with a modern monolithic architecture, it bridges a blazing-fast React frontend with a robust Node.js API.

---

## ✨ Core Features

### 🛒 Seamless Shopping Experience
- **Interactive Product Grid**: Sleek, glassmorphism-based UI for product browsing.
- **Smart Cart System**: Real-time cart updates with local persistence.
- **Dynamic Checkouts**: Hassle-free checkout with multiple payment options.

### 💳 Integrated Payment Gateway
- **Razorpay Integration**: Secure, industry-standard payment processing for online transactions.
- **Cash on Delivery (COD)**: Automated fee calculation for COD orders with ₹25 surcharge handling.

### 📝 Professional Billing & Documentation
- **Auto-Generated PDF Invoices**: Premium PDF invoices generated on-the-fly using `pdfkit`.
- **Dynamic Invoicing**: Reflects payment method (COD/Online) and status (Pending/Paid) automatically based on order lifecycle.

### 🛡️ Secure Admin Control Center
- **Advanced Order Management**: Real-time status updates (Placed → Shipped → Delivered) with full status history.
- **Shiprocket Logistics**: Automated AWB generation, manifest creation, and pickup scheduling.
- **Inventory Tracking**: Automated stock deduction upon purchase and restoration on cancellation/return.
- **Manual Tracking Overrides**: Flexibility to manually update tracking links and courier details for custom shipping methods.
- **Branded Communications**: Professional email notifications for order confirmation and status changes.

### 🚚 Smart Logistics (Shiprocket)
- **Automated Fulfillment**: Auto-push orders to Shiprocket for rapid fulfillment.
- **One-Click Documentation**: Generate and print shipping labels, manifests, and invoices directly from the admin panel.
- **Real-time Tracking**: Integrated AWB tracking for customers to monitor their parcels live.
- **Pickup Automation**: Automated pickup scheduling with customizable pickup locations.

---

## 🛠️ Tech Stack & Methodology

### **Frontend** (`/frontend`)
- **React 19**: Utilizing the latest concurrent rendering features.
- **Vite**: Ultra-fast build tool for modern web development.
- **Tailwind CSS 4**: Next-gen utility-first styling for premium visual aesthetics.
- **React Hot Toast**: Real-time feedback for user actions.

### **Backend** (`/backend`)
- **Node.js & Express**: High-performance API routing and processing.
- **MongoDB & Mongoose**: Scalable NoSQL database for flexible product schemas.
- **JWT & Bcrypt**: Secure, token-based authentication system.
- **Nodemailer**: Automated SMTP-based communication.
- **Shiprocket API**: Enterprise-grade logistics and shipping automation.
- **Razorpay API**: Seamless and secure payment gateway integration.

---

## 🚀 Deployment Guide (Vercel)

### **Recommended Method: Monorepo Setup**
For the most reliable performance, we recommend deploying the `frontend` and `backend` as separate projects in your Vercel Dashboard:

1. **Connect Repository**: Connect your GitHub repository to Vercel.
2. **Frontend Project**:
   - Set **Root Directory** to `frontend`.
   - Add Environment Variable `VITE_API_URL` pointing to your backend production URL.
3. **Backend Project**:
   - Set **Root Directory** to `backend`.
   - Add your `.env` variables:
     - `MONGO_URI`: Your MongoDB connection string.
     - `JWT_SECRET`: Secret key for authentication.
     - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: SMTP credentials.
     - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`: Razorpay credentials.
     - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`: Shiprocket credentials.
     - `SHIPROCKET_PICKUP_LOCATION`: Default pickup location name (e.g., 'Primary').

---

## 🛠️ Local Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/Kabi09/Dudez_Shop-Ecommerce.git
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

---

## 📄 License
Created and maintained by **Kabi09**. All rights reserved.

> *Premium Shopping, Instant Delivery.* 🚀
