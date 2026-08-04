const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if user can review a product (has purchased it)
router.get('/can-review/:productId', auth, async (req, res) => {
  try {
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.productId,
      orderStatus: { $in: ['delivered', 'placed', 'shipped'] }
    });
    const existingReview = await Review.findOne({ user: req.user._id, product: req.params.productId });
    res.json({ canReview: !!hasPurchased && !existingReview, hasPurchased: !!hasPurchased, hasReviewed: !!existingReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post a review (must have purchased the product)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) return res.status(400).json({ message: 'All fields are required' });

    // Check purchase
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['delivered', 'placed', 'shipped'] }
    });
    if (!hasPurchased) return res.status(403).json({ message: 'You can only review products you have purchased.' });

    // Check existing review
    const existing = await Review.findOne({ user: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product.' });

    // Change this line:
const imageUrls = (req.files || []).map(f => f.path);
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      userName: req.user.name,
      images: imageUrls
    });
    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10, numReviews: allReviews.length });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'You have already reviewed this product.' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a review
router.put('/:reviewId', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { rating, comment, keepExistingImages } = req.body;
    if (!rating || !comment) return res.status(400).json({ message: 'Rating and comment are required' });

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own reviews' });
    }

    let finalImages = [];
    if (keepExistingImages) {
      if (Array.isArray(keepExistingImages)) {
        finalImages = keepExistingImages;
      } else {
        finalImages = [keepExistingImages]; // Single string
      }
    }

    // Change this line:
const newImageUrls = (req.files || []).map(f => f.path);
    
    review.images = [...finalImages, ...newImageUrls].slice(0, 5); // Limit max 5
    review.rating = Number(rating);
    review.comment = comment;

    await review.save();

    // Update product average rating
    const allReviews = await Review.find({ product: review.product });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(review.product, { rating: Math.round(avgRating * 10) / 10, numReviews: allReviews.length });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own reviews' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
      
    await Product.findByIdAndUpdate(productId, { 
      rating: Math.round(avgRating * 10) / 10, 
      numReviews: allReviews.length 
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
