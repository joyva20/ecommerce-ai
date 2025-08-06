import express from "express";
import { createReview, getProductReviews, checkUserReview } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

// Create review (requires authentication)
reviewRouter.post('/', authUser, createReview);

// Get reviews for a product
reviewRouter.get('/product/:productId', getProductReviews);

// Check if user has reviewed a product (requires authentication)
reviewRouter.post('/check/:productId', authUser, checkUserReview);

export default reviewRouter;
