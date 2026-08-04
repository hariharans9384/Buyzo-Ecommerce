const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env
dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/reviews");
const contactRoutes = require("./routes/contact");
const categoryRoutes = require("./routes/categories");
const notificationRoutes = require("./routes/notifications");

// Route usage
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected successfully"))
  .catch((err) => {
    console.log("❌ DB not connected");
    console.log(err.message); // VERY IMPORTANT
  });

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server running on port:", process.env.PORT || 5000);
});

module.exports = app;
