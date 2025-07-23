import pickle
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import os

class OptimizedRecommendationEngine:
    def __init__(self, model_path="models/"):
        self.model_path = model_path
        self.vectorizer = None
        self.similarity_matrix = None
        self.products_df = None
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Load vectorizer
            vectorizer_path = os.path.join(self.model_path, "tfidf_vectorizer.pkl")
            if os.path.exists(vectorizer_path):
                with open(vectorizer_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
            
            # Load similarity matrix
            similarity_path = os.path.join(self.model_path, "cosine_similarity_matrix.npy")
            if os.path.exists(similarity_path):
                self.similarity_matrix = np.load(similarity_path)
            
            # Load products data
            data_path = os.path.join(self.model_path, "..", "data", "processed_products.csv")
            if os.path.exists(data_path):
                self.products_df = pd.read_csv(data_path)
            
            if self.products_df is not None:
                print(f"Models loaded successfully! {len(self.products_df)} products ready.")
                return True
            else:
                print("No pre-trained models found. Will use real-time computation.")
                return False
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def get_recommendations(self, product_id, num_recommendations=5):
        """Get recommendations using pre-computed similarity matrix or real-time computation"""
        try:
            if self.similarity_matrix is not None and self.products_df is not None:
                # Use pre-computed similarity matrix
                return self._get_precomputed_recommendations(product_id, num_recommendations)
            else:
                # Fallback to real-time computation (from app.py)
                return self._get_realtime_recommendations(product_id, num_recommendations)
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
    
    def _get_precomputed_recommendations(self, product_id, num_recommendations):
        """Get recommendations using pre-computed similarity matrix"""
        # Find product index
        product_idx = self.products_df[self.products_df['_id'] == product_id].index
        if len(product_idx) == 0:
            return []
        
        product_idx = product_idx[0]
        
        # Get similarity scores from pre-computed matrix
        sim_scores = self.similarity_matrix[product_idx]
        
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
                'similarity_score': float(sim_scores[idx])
            })
        
        return recommendations
    
    def _get_realtime_recommendations(self, product_id, num_recommendations):
        """Fallback to real-time computation if no pre-trained models"""
        # This would integrate with the existing RecommendationEngine from app.py
        # For now, return empty list
        return []
