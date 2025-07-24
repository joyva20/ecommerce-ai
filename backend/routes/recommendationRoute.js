import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

const recommendationRoute = express.Router();

// Base URL for Flask recommendation service
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5001';

// Get recommendations based on user history and cart items for checkout page
recommendationRoute.post('/checkout', async (req, res) => {
    try {
        const { cartItems } = req.body;
        const token = req.headers.token;
        
        if (!cartItems || cartItems.length === 0) {
            return res.json({ 
                success: false, 
                error: 'No cart items provided' 
            });
        }

        // Get user ID from token if provided
        let userId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (error) {
                console.log('Token verification failed:', error.message);
            }
        }

        // Start with cart-based recommendations
        const allRecommendations = [];
        const processedNames = new Set();

        // Get recommendations based on current cart items
        for (const item of cartItems) {
            try {
                const response = await axios.post(
                    `${RECOMMENDATION_SERVICE_URL}/recommendations/similar`,
                    { product_name: item.name },
                    { 
                        timeout: 5000,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                if (response.data.success && response.data.recommendations) {
                    response.data.recommendations.forEach(rec => {
                        if (!processedNames.has(rec.nama_pakaian)) {
                            processedNames.add(rec.nama_pakaian);
                            allRecommendations.push({
                                ...rec,
                                based_on: item.name,
                                source: 'cart'
                            });
                        }
                    });
                }
            } catch (itemError) {
                console.log(`Skipping recommendations for ${item.name}:`, itemError.message);
            }
        }

        // If user is logged in, get history-based recommendations
        if (userId) {
            try {
                const userOrders = await orderModel.find({ userID: userId }).sort({ date: -1 }).limit(5);
                const purchasedProducts = [];
                
                // Collect previously purchased products
                userOrders.forEach(order => {
                    order.items.forEach(item => {
                        if (item.name && !purchasedProducts.find(p => p.name === item.name)) {
                            // Normalize category to match CSV format
                            let normalizedCategory = 'General';
                            if (item.category) {
                                const cat = item.category.toLowerCase();
                                if (cat === 'men' || cat === 'man' || cat === 'male') {
                                    normalizedCategory = 'men';
                                } else if (cat === 'women' || cat === 'woman' || cat === 'female') {
                                    normalizedCategory = 'women';
                                } else if (cat === 'kids' || cat === 'children' || cat === 'child') {
                                    // Kids category fallback - use general women/men products
                                    normalizedCategory = Math.random() > 0.5 ? 'women' : 'men';
                                }
                            }
                            
                            purchasedProducts.push({
                                name: item.name,
                                category: normalizedCategory
                            });
                        }
                    });
                });

                console.log(`User ${userId} purchase history:`, purchasedProducts.length, 'products');

                // Get recommendations based on purchase history (limit to recent 3 products)
                for (const product of purchasedProducts.slice(0, 3)) {
                    try {
                        const response = await axios.post(
                            `${RECOMMENDATION_SERVICE_URL}/recommendations/similar`,
                            { product_name: product.name },
                            { 
                                timeout: 5000,
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );

                        if (response.data.success && response.data.recommendations) {
                            response.data.recommendations.forEach(rec => {
                                if (!processedNames.has(rec.nama_pakaian)) {
                                    processedNames.add(rec.nama_pakaian);
                                    allRecommendations.push({
                                        ...rec,
                                        based_on: product.name,
                                        source: 'history',
                                        similarity_score: rec.similarity_score * 0.8 // Slightly lower weight for history
                                    });
                                }
                            });
                        }
                    } catch (historyError) {
                        console.log(`Skipping history recommendations for ${product.name}:`, historyError.message);
                    }
                }
            } catch (historyError) {
                console.log('Error getting user history:', historyError.message);
            }
        }

        // Sort by similarity score and take top 6
        allRecommendations.sort((a, b) => b.similarity_score - a.similarity_score);
        const topRecommendations = allRecommendations.slice(0, 6);

        res.json({
            success: true,
            recommendations: topRecommendations,
            total: topRecommendations.length,
            based_on_items: cartItems.map(item => item.name),
            user_id: userId,
            personalized: !!userId
        });

    } catch (error) {
        console.error('Checkout recommendations error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Recommendation service unavailable' 
        });
    }
});

// Get similar products based on product ID (legacy support)
recommendationRoute.get('/similar/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = req.query.limit || 5;
        
        const response = await axios.get(
            `${RECOMMENDATION_SERVICE_URL}/recommendations/similar/${productId}?limit=${limit}`,
            { timeout: 5000 }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Recommendation service error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Recommendation service unavailable' 
        });
    }
});

// Get category-based recommendations
recommendationRoute.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const limit = req.query.limit || 10;
        
        const response = await axios.get(
            `${RECOMMENDATION_SERVICE_URL}/recommendations/category/${category}?limit=${limit}`,
            { timeout: 5000 }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Recommendation service error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Recommendation service unavailable' 
        });
    }
});

// Refresh recommendation data
recommendationRoute.post('/refresh', async (req, res) => {
    try {
        const response = await axios.post(
            `${RECOMMENDATION_SERVICE_URL}/recommendations/refresh`,
            {},
            { timeout: 10000 }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Recommendation service error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to refresh recommendation data' 
        });
    }
});

// Get recommendation service health
recommendationRoute.get('/health', async (req, res) => {
    try {
        const response = await axios.get(
            `${RECOMMENDATION_SERVICE_URL}/health`,
            { timeout: 3000 }
        );
        
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ 
            success: false, 
            error: 'Recommendation service is down' 
        });
    }
});

export default recommendationRoute;
