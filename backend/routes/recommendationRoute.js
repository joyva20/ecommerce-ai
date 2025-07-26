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

// Get personalized recommendations with dominance logic
recommendationRoute.get('/personalized', async (req, res) => {
    try {
        const token = req.headers.token;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!token) {
            return res.json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify token and get user ID
        let userId = null;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            return res.json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Get user's purchase history
        const userOrders = await orderModel.find({ userID: userId }).sort({ date: -1 });
        
        if (userOrders.length === 0) {
            return res.json({
                success: true,
                recommendations: [],
                message: 'No purchase history found',
                dominance: null
            });
        }

        // Analyze dominance based on Category + Type combination
        const categoryTypeCount = {};
        const categoryCount = {};
        const typeCount = {};
        const purchasedProducts = [];
        
        console.log(`📊 Analyzing ${userOrders.length} orders for user ${userId}`);
        
        userOrders.forEach(order => {
            console.log(`📦 Order ${order._id} has ${order.items.length} items`);
            order.items.forEach(item => {
                console.log(`🏷️ Item: ${item.name}, Category: ${item.category}, SubCategory: ${item.subCategory}`);
                if (item.name && item.category && item.subCategory) {
                    // Normalize category
                    let normalizedCategory = item.category.toLowerCase();
                    if (normalizedCategory === 'man' || normalizedCategory === 'male') {
                        normalizedCategory = 'men';
                    } else if (normalizedCategory === 'woman' || normalizedCategory === 'female') {
                        normalizedCategory = 'women';
                    } else if (normalizedCategory === 'kids' || normalizedCategory === 'children' || normalizedCategory === 'child') {
                        // Kids fallback to men/women randomly
                        normalizedCategory = Math.random() > 0.5 ? 'women' : 'men';
                    }

                    // Normalize subCategory (type)
                    const normalizedType = item.subCategory.toLowerCase();
                    
                    // Count categories separately
                    categoryCount[normalizedCategory] = (categoryCount[normalizedCategory] || 0) + 1;
                    typeCount[normalizedType] = (typeCount[normalizedType] || 0) + 1;
                    
                    const categoryType = `${normalizedCategory}_${normalizedType}`;
                    categoryTypeCount[categoryType] = (categoryTypeCount[categoryType] || 0) + 1;
                    
                    console.log(`✅ Processed: ${normalizedCategory}_${normalizedType} (count: ${categoryTypeCount[categoryType]})`);
                    
                    // Store product for recommendations
                    if (!purchasedProducts.find(p => p.name === item.name)) {
                        purchasedProducts.push({
                            name: item.name,
                            category: normalizedCategory,
                            type: normalizedType
                        });
                    }
                } else {
                    console.log(`❌ Skipping item ${item.name}: missing category(${item.category}) or subCategory(${item.subCategory})`);
                }
            });
        });

        console.log(`📊 Category count:`, categoryCount);
        console.log(`📊 Type count:`, typeCount);
        console.log(`📊 CategoryType count:`, categoryTypeCount);

        // Determine TYPE dominance (primary) and CATEGORY distribution (secondary)
        const typeEntries = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
        const categoryEntries = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
        
        if (typeEntries.length === 0 || categoryEntries.length === 0) {
            return res.json({
                success: true,
                recommendations: [],
                message: 'No valid category or type found',
                dominance: null
            });
        }
        
        // Primary: Type distribution (60:40 or 50:50 based on dominance)
        let typeDistribution = {};
        if (typeEntries.length === 1) {
            typeDistribution[typeEntries[0][0]] = limit;
        } else if (typeEntries[0][1] === typeEntries[1][1]) {
            // Type tie - 50:50
            const type1 = typeEntries[0][0];
            const type2 = typeEntries[1][0];
            typeDistribution[type1] = Math.floor(limit / 2);
            typeDistribution[type2] = limit - typeDistribution[type1];
            console.log(`🤝 Type tie: ${type1}=${typeEntries[0][1]}, ${type2}=${typeEntries[1][1]}`);
        } else {
            // Type dominance - 60:40
            const dominantType = typeEntries[0][0];
            const secondaryType = typeEntries[1][0];
            typeDistribution[dominantType] = Math.ceil(limit * 0.6);
            typeDistribution[secondaryType] = limit - typeDistribution[dominantType];
            console.log(`👑 Type dominance: ${dominantType}=${typeEntries[0][1]} > ${secondaryType}=${typeEntries[1][1]}`);
        }
        
        // Secondary: Category distribution for each type
        let categoryDistribution = {};
        if (categoryEntries.length === 1) {
            categoryDistribution[categoryEntries[0][0]] = 1.0; // 100%
        } else if (categoryEntries[0][1] === categoryEntries[1][1]) {
            // Category tie - 50:50
            categoryDistribution[categoryEntries[0][0]] = 0.5;
            categoryDistribution[categoryEntries[1][0]] = 0.5;
            console.log(`🤝 Category tie: ${categoryEntries[0][0]}=${categoryEntries[0][1]}, ${categoryEntries[1][0]}=${categoryEntries[1][1]}`);
        } else {
            // Category dominance - 60:40
            categoryDistribution[categoryEntries[0][0]] = 0.6;
            categoryDistribution[categoryEntries[1][0]] = 0.4;
            console.log(`👑 Category dominance: ${categoryEntries[0][0]}=${categoryEntries[0][1]} > ${categoryEntries[1][0]}=${categoryEntries[1][1]}`);
        }
        
        console.log(`📋 Type distribution for ${limit} items:`, typeDistribution);
        console.log(`📋 Category distribution ratios:`, categoryDistribution);

        // Get recommendations based on purchase history
        const allRecommendations = [];
        const processedNames = new Set();

        // Get recommendations from recent purchases (limit to 5 most recent)
        for (const product of purchasedProducts.slice(0, 5)) {
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
                                based_on: product.name
                            });
                        }
                    });
                }
            } catch (error) {
                console.log(`Skipping recommendations for ${product.name}:`, error.message);
            }
        }

        console.log(`🔍 Found ${allRecommendations.length} total recommendations from ML service`);

        // Distribute recommendations based on TYPE priority, then CATEGORY
        const finalRecommendations = [];
        
        for (const [targetType, typeCount] of Object.entries(typeDistribution)) {
            console.log(`🎯 Looking for ${typeCount} items of type: ${targetType}`);
            
            // Distribute this type's items across categories
            const typeRecommendations = [];
            
            for (const [targetCategory, categoryRatio] of Object.entries(categoryDistribution)) {
                const categoryCount = Math.round(typeCount * categoryRatio);
                console.log(`📊 Need ${categoryCount} items: ${targetCategory} ${targetType}`);
                
                // Find recommendations matching this category-type combination
                const categoryTypeRecommendations = [];
                
                for (const rec of allRecommendations) {
                    try {
                        const product = await productModel.findOne({ name: rec.nama_pakaian });
                        
                        if (product) {
                            let productCategory = product.category.toLowerCase();
                            if (productCategory === 'man' || productCategory === 'male') {
                                productCategory = 'men';
                            } else if (productCategory === 'woman' || productCategory === 'female') {
                                productCategory = 'women';
                            }
                            
                            const productType = product.subCategory.toLowerCase();
                            
                            if (productCategory === targetCategory && productType === targetType) {
                                categoryTypeRecommendations.push({
                                    ...rec,
                                    product_category: productCategory,
                                    product_type: productType,
                                    matches_dominance: true
                                });
                            }
                        }
                    } catch (dbError) {
                        console.log(`Error checking product ${rec.nama_pakaian}:`, dbError.message);
                    }
                }
                
                // Add top recommendations for this category-type combination
                const selected = categoryTypeRecommendations
                    .sort((a, b) => b.similarity_score - a.similarity_score)
                    .slice(0, categoryCount);
                    
                console.log(`✅ Selected ${selected.length} items for ${targetCategory} ${targetType}`);
                typeRecommendations.push(...selected);
            }
            
            finalRecommendations.push(...typeRecommendations);
        }

        // ENHANCED FALLBACK: If not enough targeted recommendations, fill with ANY recommendations
        console.log(`📊 Current recommendations: ${finalRecommendations.length}/${limit}`);
        
        if (finalRecommendations.length < limit) {
            console.log(`🔄 Need more recommendations! Adding fallback...`);
            const remainingSlots = limit - finalRecommendations.length;
            const usedNames = new Set(finalRecommendations.map(r => r.nama_pakaian));
            
            // Add any available recommendations as fallback
            const fallbackRecs = allRecommendations
                .filter(rec => !usedNames.has(rec.nama_pakaian))
                .sort((a, b) => b.similarity_score - a.similarity_score)
                .slice(0, remainingSlots)
                .map(rec => ({
                    ...rec,
                    matches_dominance: false,
                    fallback_mode: true
                }));
                
            console.log(`🔄 Added ${fallbackRecs.length} fallback recommendations`);
            finalRecommendations.push(...fallbackRecs);
        }

        // ULTIMATE FALLBACK: If still not enough, get random products from database
        if (finalRecommendations.length < Math.min(5, limit)) {
            console.log(`🆘 Still not enough! Getting random products from database...`);
            try {
                const randomProducts = await productModel.aggregate([
                    { $sample: { size: limit } }
                ]);
                
                const usedNames = new Set(finalRecommendations.map(r => r.nama_pakaian || r.name));
                const remainingSlots = limit - finalRecommendations.length;
                
                const dbFallbacks = randomProducts
                    .filter(product => !usedNames.has(product.name))
                    .slice(0, remainingSlots)
                    .map(product => ({
                        nama_pakaian: product.name,
                        similarity_score: 0.5, // Default score
                        based_on: 'database_fallback',
                        matches_dominance: false,
                        fallback_mode: true,
                        database_fallback: true
                    }));
                    
                console.log(`🆘 Added ${dbFallbacks.length} database fallback products`);
                finalRecommendations.push(...dbFallbacks);
            } catch (dbError) {
                console.log(`Database fallback error:`, dbError.message);
            }
        }

        // Sort final recommendations by similarity score
        finalRecommendations.sort((a, b) => b.similarity_score - a.similarity_score);

        // Prepare dominance info based on TYPE priority
        const topType = typeEntries[0];
        const topCategory = categoryEntries[0];
        const dominanceInfo = {
            primary_type: topType[0],
            primary_type_count: topType[1],
            primary_category: topCategory[0],
            primary_category_count: topCategory[1],
            type_distribution: typeDistribution,
            category_distribution: categoryDistribution,
            is_type_tie: typeEntries.length > 1 && typeEntries[0][1] === typeEntries[1][1],
            is_category_tie: categoryEntries.length > 1 && categoryEntries[0][1] === categoryEntries[1][1]
        };

        res.json({
            success: true,
            recommendations: finalRecommendations.slice(0, limit),
            total: Math.min(finalRecommendations.length, limit),
            dominance: dominanceInfo,
            user_id: userId,
            analysis: {
                categoryCount,
                typeCount,
                categoryTypeCount,
                typeDistribution,
                categoryDistribution
            },
            fallback_used: finalRecommendations.some(r => r.fallback_mode),
            database_fallback_used: finalRecommendations.some(r => r.database_fallback)
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get personalized recommendations' 
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
