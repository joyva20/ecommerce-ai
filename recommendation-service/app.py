from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
from bson import ObjectId
import os
from dotenv import load_dotenv
import json
from optimized_engine import OptimizedRecommendationEngine

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ecommerce')
client = pymongo.MongoClient(MONGO_URI)
db = client['ecommerce']
products_collection = db['products']

class RecommendationEngine:
    def __init__(self):
        self.products_df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        
    def load_products(self):
        """Load products from MongoDB"""
        try:
            products = list(products_collection.find({}))
            if not products:
                return None
                
            # Convert to DataFrame
            df_data = []
            for product in products:
                df_data.append({
                    '_id': str(product['_id']),
                    'name': product.get('name', ''),
                    'category': product.get('category', ''),
                    'subCategory': product.get('subCategory', ''),
                    'description': product.get('description', ''),
                    'price': product.get('price', 0),
                    'sizes': ','.join(product.get('sizes', [])),
                    'image': product.get('image', []),
                    'bestseller': product.get('bestseller', False)
                })
            
            self.products_df = pd.DataFrame(df_data)
            return True
        except Exception as e:
            print(f"Error loading products: {e}")
            return False
    
    def create_content_features(self):
        """Create content-based features for products"""
        if self.products_df is None:
            return False
            
        # Combine text features
        self.products_df['content_features'] = (
            self.products_df['name'].fillna('') + ' ' +
            self.products_df['category'].fillna('') + ' ' +
            self.products_df['subCategory'].fillna('') + ' ' +
            self.products_df['description'].fillna('') + ' ' +
            self.products_df['sizes'].fillna('')
        )
        
        # Create TF-IDF matrix
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df['content_features'])
        return True
    
    def get_recommendations(self, product_id, num_recommendations=5):
        """Get product recommendations based on content similarity"""
        try:
            # Find product index
            product_idx = self.products_df[self.products_df['_id'] == product_id].index
            if len(product_idx) == 0:
                return []
            
            product_idx = product_idx[0]
            
            # Calculate cosine similarity
            sim_scores = cosine_similarity(
                self.tfidf_matrix[product_idx:product_idx+1], 
                self.tfidf_matrix
            ).flatten()
            
            # Get similar products (excluding the product itself)
            similar_indices = sim_scores.argsort()[::-1][1:num_recommendations+1]
            
            recommendations = []
            for idx in similar_indices:
                product = self.products_df.iloc[idx]
                recommendations.append({
                    'productId': product['_id'],
                    'name': product['name'],
                    'category': product['category'],
                    'price': product['price'],
                    'image': product['image'],
                    'similarity_score': float(sim_scores[idx])
                })
            
            return recommendations
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
    
    def get_category_recommendations(self, category, num_recommendations=10):
        """Get popular products from specific category"""
        try:
            category_products = self.products_df[
                self.products_df['category'].str.lower() == category.lower()
            ]
            
            if len(category_products) == 0:
                return []
            
            # Sort by bestseller and price
            category_products = category_products.sort_values(
                ['bestseller', 'price'], 
                ascending=[False, True]
            )
            
            recommendations = []
            for _, product in category_products.head(num_recommendations).iterrows():
                recommendations.append({
                    'productId': product['_id'],
                    'name': product['name'],
                    'category': product['category'],
                    'price': product['price'],
                    'image': product['image'],
                    'bestseller': product['bestseller']
                })
            
            return recommendations
        except Exception as e:
            print(f"Error getting category recommendations: {e}")
            return []

# Initialize recommendation engines
rec_engine = RecommendationEngine()  # Real-time engine
optimized_engine = OptimizedRecommendationEngine()  # Pre-trained engine

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'recommendation-engine'})

@app.route('/recommendations/similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    """Get similar products based on content"""
    try:
        num_recs = request.args.get('limit', 5, type=int)
        
        # Try optimized engine first (pre-trained models)
        if optimized_engine.similarity_matrix is not None:
            recommendations = optimized_engine.get_recommendations(product_id, num_recs)
            method = 'pre-trained'
        else:
            # Fallback to real-time computation
            if rec_engine.products_df is None:
                if not rec_engine.load_products():
                    return jsonify({'error': 'Failed to load products'}), 500
                if not rec_engine.create_content_features():
                    return jsonify({'error': 'Failed to create features'}), 500
            
            recommendations = rec_engine.get_recommendations(product_id, num_recs)
            method = 'real-time'
        
        return jsonify({
            'success': True,
            'productId': product_id,
            'recommendations': recommendations,
            'method': method,
            'count': len(recommendations)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/category/<category>', methods=['GET'])
def get_category_products(category):
    """Get popular products from category"""
    try:
        num_recs = request.args.get('limit', 10, type=int)
        
        if rec_engine.products_df is None:
            if not rec_engine.load_products():
                return jsonify({'error': 'Failed to load products'}), 500
        
        recommendations = rec_engine.get_category_recommendations(category, num_recs)
        
        return jsonify({
            'success': True,
            'category': category,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations/refresh', methods=['POST'])
def refresh_data():
    """Refresh product data and rebuild features"""
    try:
        if not rec_engine.load_products():
            return jsonify({'error': 'Failed to load products'}), 500
        if not rec_engine.create_content_features():
            return jsonify({'error': 'Failed to create features'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Recommendation data refreshed successfully',
            'total_products': len(rec_engine.products_df)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize data on startup
    print("Starting Recommendation Service...")
    print("Checking for pre-trained models...")
    
    if optimized_engine.similarity_matrix is not None:
        print(f"✅ Pre-trained models loaded! {len(optimized_engine.products_df)} products ready.")
        print("🚀 Using optimized similarity matrix for faster recommendations.")
    else:
        print("⚠️  No pre-trained models found. Initializing real-time engine...")
        if rec_engine.load_products():
            rec_engine.create_content_features()
            print(f"✅ Real-time engine loaded {len(rec_engine.products_df)} products")
        else:
            print("❌ Warning: No products loaded on startup")
    
    print("🔄 Hybrid recommendation system ready!")
    app.run(host='0.0.0.0', port=5001, debug=True)
