import express from 'express';
import axios from 'axios';

const recommendationRoute = express.Router();

// Base URL for recommendation service
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5001';

// Get similar products based on product ID
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
