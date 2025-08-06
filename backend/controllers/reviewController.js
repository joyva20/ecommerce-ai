import reviewModel from "../models/reviewModel.js";

// Create review
const createReview = async (req, res) => {
  try {
    console.log('Review request body:', req.body);
    console.log('Review request headers:', req.headers);
    
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.body.userID; // From auth middleware (note: userID not userId)
    
    console.log('Extracted data:', { productId, orderId, rating, comment, userId });
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    // Check if user already reviewed this product for this order
    const existingReview = await reviewModel.findOne({
      user: userId,
      product: productId,
      order: orderId
    });
    
    if (existingReview) {
      console.log('Review already exists:', existingReview);
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    
    const review = new reviewModel({
      user: userId,
      product: productId,
      order: orderId,
      rating,
      comment
    });
    
    console.log('Creating review:', review);
    await review.save();
    console.log('Review saved successfully');
    
    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await reviewModel.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user has already reviewed a product
const checkUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userID; // From auth middleware
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const existingReview = await reviewModel.findOne({
      user: userId,
      product: productId
    }).populate('user', 'name');
    
    if (existingReview) {
      return res.json({ 
        success: true, 
        hasReviewed: true, 
        review: existingReview 
      });
    }
    
    res.json({ success: true, hasReviewed: false });
  } catch (error) {
    console.error('Check user review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createReview, getProductReviews, checkUserReview };
