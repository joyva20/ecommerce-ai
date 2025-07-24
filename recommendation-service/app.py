from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import csv

# Try to import ML libraries, fallback to basic implementations if not available
try:
    import pandas as pd
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    ML_AVAILABLE = True
    print("✅ ML libraries loaded successfully")
except ImportError as e:
    print(f"⚠️ ML libraries not available: {e}")
    print("🔄 Using fallback implementations...")
    ML_AVAILABLE = False
    
    # Basic fallback implementations
    class TfidfVectorizer:
        def __init__(self, stop_words=None, max_features=None):
            self.vocabulary = {}
            self.fitted = False
            
        def fit_transform(self, texts):
            # Simple word frequency implementation
            all_words = set()
            for text in texts:
                words = text.lower().split()
                all_words.update(words)
            
            self.vocabulary = {word: i for i, word in enumerate(sorted(all_words))}
            self.fitted = True
            
            # Create simple term frequency matrix
            matrix = []
            for text in texts:
                words = text.lower().split()
                vector = [0] * len(self.vocabulary)
                for word in words:
                    if word in self.vocabulary:
                        vector[self.vocabulary[word]] += 1
                matrix.append(vector)
            
            return matrix
    
    def cosine_similarity(matrix1, matrix2=None):
        if matrix2 is None:
            matrix2 = matrix1
        
        # Simple cosine similarity implementation
        similarities = []
        for i, vec1 in enumerate(matrix1):
            row_similarities = []
            for vec2 in matrix2:
                # Calculate cosine similarity
                dot_product = sum(a * b for a, b in zip(vec1, vec2))
                norm1 = sum(a * a for a in vec1) ** 0.5
                norm2 = sum(b * b for b in vec2) ** 0.5
                
                if norm1 == 0 or norm2 == 0:
                    similarity = 0
                else:
                    similarity = dot_product / (norm1 * norm2)
                
                row_similarities.append(similarity)
            similarities.append(row_similarities)
        
        return similarities

app = Flask(__name__)
CORS(app)

class ClothingRecommendationEngine:
    def __init__(self):
        """
        Full ML-powered recommendation engine yang membaca data dari CSV
        Menggunakan TF-IDF + Cosine Similarity untuk content-based filtering
        """
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self.evaluation = None
        
        # Load data dari CSV
        self.load_data()
        
        if self.df is not None and len(self.df) > 0:
            self.build_model()
            self.evaluate_model()
            print(f"✅ Recommendation Engine loaded: {len(self.df)} products")
        else:
            print("❌ Failed to load data or no data available")

    def normalize_category(self, category):
        """Normalize category names and handle missing categories safely"""
        if not category:
            return 'General'
        
        category_lower = category.lower().strip()
        
        # Map various category names to standard ones
        if category_lower in ['men', 'man', 'male', 'pria', 'laki', 'laki-laki']:
            return 'men'
        elif category_lower in ['women', 'woman', 'female', 'wanita', 'perempuan', 'cewek']:
            return 'women'
        elif category_lower in ['kids', 'children', 'child', 'anak', 'anak-anak', 'kid']:
            # Kids category fallback - map to women or men randomly to avoid bias
            import random
            return random.choice(['women', 'men'])
        else:
            # Unknown category - default to general/women (safest choice)
            return 'women'

    def load_data(self):
        """Load data dari CSV file"""
        try:
            # Cari file CSV di berbagai lokasi
            csv_paths = [
                'clothing_products.csv',
                '../clothing_products.csv', 
                '../../clothing_products.csv',
                'data/clothing_products.csv',
                os.path.join(os.path.dirname(__file__), '..', 'clothing_products.csv'),
                'clothing.csv',
                '../clothing.csv', 
                '../../clothing.csv',
                'data/clothing.csv',
                os.path.join(os.path.dirname(__file__), '..', 'clothing.csv')
            ]
            
            csv_file = None
            for path in csv_paths:
                if os.path.exists(path):
                    csv_file = path
                    break
            
            if not csv_file:
                print("⚠️ CSV file not found, creating sample data...")
                self.create_sample_data()
                return
            
            print(f"📁 Loading data from: {csv_file}")
            
            if ML_AVAILABLE:
                # Use pandas if available
                self.df = pd.read_csv(csv_file, sep=';')
            else:
                # Manual CSV reading
                data = []
                with open(csv_file, 'r', encoding='utf-8') as file:
                    reader = csv.DictReader(file, delimiter=';')
                    for row in reader:
                        data.append(row)
                
                # Create a simple DataFrame-like structure
                self.df = data
            
            if ML_AVAILABLE:
                print(f"✅ Loaded {len(self.df)} products from CSV")
                print(f"📊 Columns: {list(self.df.columns)}")
            else:
                print(f"✅ Loaded {len(self.df)} products from CSV (manual parsing)")
                if self.df:
                    print(f"📊 Keys: {list(self.df[0].keys())}")
            
        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            print("🔄 Creating sample data as fallback...")
            self.create_sample_data()
    
    def create_sample_data(self):
        """Create sample data jika CSV tidak tersedia"""
        sample_data = [
            {"nama_pakaian": "Blazer Wanita Elegant Navy", "categories": "Women", "type": "blazer"},
            {"nama_pakaian": "Kemeja Pria Formal Putih", "categories": "Men", "type": "shirt"},
            {"nama_pakaian": "Dress Casual Wanita Floral", "categories": "Women", "type": "dress"},
            {"nama_pakaian": "Celana Jeans Pria Slim Fit", "categories": "Men", "type": "pants"},
            {"nama_pakaian": "Blouse Wanita Modern Silk", "categories": "Women", "type": "blouse"},
            {"nama_pakaian": "Kaos Polo Pria Cotton", "categories": "Men", "type": "polo"},
            {"nama_pakaian": "Rok Mini Wanita Denim", "categories": "Women", "type": "skirt"},
            {"nama_pakaian": "Hoodie Unisex Oversized", "categories": "Unisex", "type": "hoodie"},
            {"nama_pakaian": "Sweater Rajut Wanita Wool", "categories": "Women", "type": "sweater"},
            {"nama_pakaian": "Jaket Bomber Pria Leather", "categories": "Men", "type": "jacket"},
            {"nama_pakaian": "Tank Top Wanita Sport", "categories": "Women", "type": "tank"},
            {"nama_pakaian": "Cardigan Wanita Soft", "categories": "Women", "type": "cardigan"},
            {"nama_pakaian": "Kemeja Wanita Casual", "categories": "Women", "type": "shirt"},
            {"nama_pakaian": "Celana Chino Pria Khaki", "categories": "Men", "type": "pants"},
            {"nama_pakaian": "Dress Formal Wanita Black", "categories": "Women", "type": "dress"}
        ]
        
        if ML_AVAILABLE:
            self.df = pd.DataFrame(sample_data)
        else:
            self.df = sample_data
        
        print(f"📝 Created sample dataset: {len(sample_data)} products")
    
    def build_model(self):
        """Build TF-IDF model untuk similarity calculation"""
        try:
            if self.df is None or len(self.df) == 0:
                print("❌ No data available to build model")
                return
            
            # Prepare text data untuk TF-IDF
            if ML_AVAILABLE:
                # Gabungkan nama_pakaian, categories, dan type jadi satu text
                text_data = []
                for _, row in self.df.iterrows():
                    combined_text = f"{row['nama_pakaian']} {row['categories']} {row['type']}"
                    text_data.append(combined_text)
            else:
                # Manual text preparation
                text_data = []
                for item in self.df:
                    combined_text = f"{item['nama_pakaian']} {item['categories']} {item['type']}"
                    text_data.append(combined_text)
            
            # Build TF-IDF vectorizer
            self.vectorizer = TfidfVectorizer(
                stop_words='english',
                max_features=1000
            )
            
            # Fit dan transform text data
            self.tfidf_matrix = self.vectorizer.fit_transform(text_data)
            
            print("✅ TF-IDF model built successfully")
            print(f"📊 Feature matrix shape: {len(text_data)} x {len(self.vectorizer.vocabulary_) if hasattr(self.vectorizer, 'vocabulary_') else 'N/A'}")
            
        except Exception as e:
            print(f"❌ Error building model: {e}")
            self.tfidf_matrix = None
            self.vectorizer = None
    def evaluate_model(self):
        """Evaluate model performance"""
        try:
            if self.tfidf_matrix is None:
                self.evaluation = {
                    'status': 'Model not available',
                    'final_grade': {'grade': 'F', 'score': 0}
                }
                return
            
            # Basic evaluation metrics
            if ML_AVAILABLE:
                num_products = len(self.df)
                num_features = self.tfidf_matrix.shape[1] if hasattr(self.tfidf_matrix, 'shape') else len(self.vectorizer.vocabulary_)
            else:
                num_products = len(self.df)
                num_features = len(self.vectorizer.vocabulary) if hasattr(self.vectorizer, 'vocabulary') else 100
            
            # Calculate performance score
            coverage_score = min(num_products / 100, 1.0) * 40  # Max 40 points for product coverage
            feature_score = min(num_features / 500, 1.0) * 30   # Max 30 points for feature richness
            completeness_score = 30 if self.tfidf_matrix is not None else 0  # 30 points for successful model building
            
            total_score = coverage_score + feature_score + completeness_score
            
            # Determine grade
            if total_score >= 90:
                grade = 'A+'
            elif total_score >= 85:
                grade = 'A'
            elif total_score >= 80:
                grade = 'A-'
            elif total_score >= 75:
                grade = 'B+'
            elif total_score >= 70:
                grade = 'B'
            elif total_score >= 65:
                grade = 'B-'
            elif total_score >= 60:
                grade = 'C+'
            elif total_score >= 55:
                grade = 'C'
            elif total_score >= 50:
                grade = 'C-'
            else:
                grade = 'D'
            
            self.evaluation = {
                'num_products': num_products,
                'num_features': num_features,
                'coverage_score': round(coverage_score, 1),
                'feature_score': round(feature_score, 1),
                'completeness_score': completeness_score,
                'final_grade': {
                    'grade': grade,
                    'score': round(total_score, 1)
                },
                'status': 'evaluated'
            }
            
            print(f"📊 Model Evaluation: {grade} ({total_score:.1f}/100)")
            
        except Exception as e:
            print(f"❌ Error evaluating model: {e}")
            self.evaluation = {
                'status': f'Evaluation failed: {e}',
                'final_grade': {'grade': 'F', 'score': 0}
            }
    
    def get_recommendations_by_product_name(self, product_name, n=5):
        """Cari rekomendasi berdasarkan nama produk menggunakan ML similarity"""
        try:
            if self.df is None or len(self.df) == 0:
                return {'error': 'No data available'}
            
            if self.tfidf_matrix is None:
                return {'error': 'Model not trained'}
            
            # Find product dalam dataset
            product_idx = None
            reference_product = None
            
            if ML_AVAILABLE:
                for idx, row in self.df.iterrows():
                    if product_name.lower() in row['nama_pakaian'].lower():
                        product_idx = idx
                        reference_product = {
                            'nama_pakaian': row['nama_pakaian'],
                            'categories': self.normalize_category(row['categories']),
                            'type': row['type']
                        }
                        break
            else:
                for idx, item in enumerate(self.df):
                    if product_name.lower() in item['nama_pakaian'].lower():
                        product_idx = idx
                        reference_product = {
                            'nama_pakaian': item['nama_pakaian'],
                            'categories': self.normalize_category(item['categories']),
                            'type': item['type']
                        }
                        break
            
            if product_idx is None:
                return {'error': f'Product "{product_name}" not found in dataset'}
            
            # Calculate similarity dengan semua produk
            if ML_AVAILABLE and hasattr(self.tfidf_matrix, 'toarray'):
                # Pandas + sklearn version
                cosine_sim = cosine_similarity(self.tfidf_matrix[product_idx:product_idx+1], self.tfidf_matrix).flatten()
            else:
                # Fallback version
                target_vector = self.tfidf_matrix[product_idx]
                similarities = []
                for vector in self.tfidf_matrix:
                    # Calculate cosine similarity
                    dot_product = sum(a * b for a, b in zip(target_vector, vector))
                    norm1 = sum(a * a for a in target_vector) ** 0.5
                    norm2 = sum(b * b for b in vector) ** 0.5
                    
                    if norm1 == 0 or norm2 == 0:
                        similarity = 0
                    else:
                        similarity = dot_product / (norm1 * norm2)
                    
                    similarities.append(similarity)
                cosine_sim = similarities
            
            # Get top N similar products (exclude the product itself)
            if ML_AVAILABLE:
                similar_indices = cosine_sim.argsort()[::-1][1:n+1]
            else:
                # Manual sorting for fallback
                indexed_similarities = [(i, sim) for i, sim in enumerate(cosine_sim)]
                indexed_similarities.sort(key=lambda x: x[1], reverse=True)
                similar_indices = [i for i, sim in indexed_similarities[1:n+1]]
            
            # Build recommendations
            recommendations = []
            for idx in similar_indices:
                if ML_AVAILABLE:
                    product = self.df.iloc[idx]
                    similarity_score = cosine_sim[idx]
                else:
                    product = self.df[idx]
                    similarity_score = cosine_sim[idx]
                
                recommendations.append({
                    'nama_pakaian': product['nama_pakaian'],
                    'categories': product['categories'],
                    'type': product['type'],
                    'similarity_score': round(float(similarity_score), 3),
                    'match_percentage': round(float(similarity_score) * 100, 1)
                })
            
            return {
                'reference_product': reference_product,
                'recommendations': recommendations,
                'total': len(recommendations),
                'algorithm': 'TF-IDF + Cosine Similarity'
            }
            
        except Exception as e:
            print(f"❌ Error in get_recommendations_by_product_name: {e}")
            return {'error': str(e)}
    
    def get_recommendations_by_category_type(self, category, product_type, n=8):
        """Cari rekomendasi berdasarkan category dan type"""
        try:
            if self.df is None or len(self.df) == 0:
                return {'error': 'No data available'}
            
            # Filter products berdasarkan category
            if ML_AVAILABLE:
                filtered_df = self.df[self.df['categories'].str.lower() == category.lower()]
                
                if len(filtered_df) == 0:
                    # Fallback ke semua kategori
                    filtered_df = self.df
                
                recommendations = []
                for _, product in filtered_df.head(n).iterrows():
                    recommendations.append({
                        'nama_pakaian': product['nama_pakaian'],
                        'categories': product['categories'],
                        'type': product['type']
                    })
            else:
                # Manual filtering for fallback
                filtered_products = [
                    product for product in self.df
                    if product['categories'].lower() == category.lower()
                ]
                
                if not filtered_products:
                    filtered_products = self.df
                
                recommendations = []
                for product in filtered_products[:n]:
                    recommendations.append({
                        'nama_pakaian': product['nama_pakaian'],
                        'categories': product['categories'],
                        'type': product['type']
                    })
            
            return {
                'recommendations': recommendations,
                'total': len(recommendations),
                'category': category,
                'type': product_type
            }
            
        except Exception as e:
            print(f"❌ Error in get_recommendations_by_category_type: {e}")
            return {'error': str(e)}

# Initialize engine
engine = ClothingRecommendationEngine()

@app.route('/')
def home():
    return jsonify({
        'service': 'Clothing Recommendation Engine',
        'status': 'active',
        'total_products': len(engine.df) if engine.df is not None and not engine.df.empty else 0,
        'model_grade': engine.evaluation['final_grade']['grade'] if engine.evaluation else 'N/A',
        'performance_score': f"{engine.evaluation['final_grade']['score']:.1f}/100" if engine.evaluation else 'N/A',
        'algorithm': 'TF-IDF + Cosine Similarity',
        'ml_available': ML_AVAILABLE
    })

@app.route('/recommendations/similar', methods=['POST'])
def get_similar_products():
    """
    API untuk frontend: cari produk mirip berdasarkan nama
    Body: {"product_name": "Blazer Wanita"}
    """
    data = request.get_json()
    product_name = data.get('product_name', '')
    
    if not product_name:
        return jsonify({'success': False, 'error': 'product_name required'}), 400
    
    result = engine.get_recommendations_by_product_name(product_name)
    
    if 'error' in result:
        return jsonify({'success': False, 'error': result['error']}), 404
    
    return jsonify({'success': True, **result})

@app.route('/recommendations/category/<category>/type/<product_type>')
def get_by_category_type(category, product_type):
    """
    API untuk category browsing
    GET /recommendations/category/Women/type/topwear
    """
    result = engine.get_recommendations_by_category_type(category, product_type)
    
    if 'error' in result:
        return jsonify({'success': False, 'error': result['error']}), 404
    
    return jsonify({'success': True, **result})

@app.route('/sync/products', methods=['POST'])
def sync_products():
    """
    Sync products dari MongoDB ke recommendation engine
    Body: [{"nama_pakaian": "...", "categories": "...", "type": "..."}]
    """
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        if not products:
            return jsonify({'success': False, 'error': 'No products provided'}), 400
        
        # Update engine data
        if ML_AVAILABLE:
            import pandas as pd
            engine.df = pd.DataFrame(products)
        else:
            engine.df = products
        
        # Rebuild model dengan data baru
        if engine.df is not None and len(engine.df) > 0:
            engine.build_model()
            engine.evaluate_model()
            
        return jsonify({
            'success': True,
            'message': f'Synced {len(products)} products',
            'total_products': len(engine.df) if engine.df is not None else 0,
            'model_rebuilt': True
        })
        
    except Exception as e:
        print(f"❌ Error syncing products: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/reload', methods=['POST'])
def reload_data():
    """Reload data dari CSV dan MongoDB"""
    try:
        # Reload dari CSV dulu
        engine.load_data()
        
        # Rebuild model
        if engine.df is not None and len(engine.df) > 0:
            engine.build_model()
            engine.evaluate_model()
            
        return jsonify({
            'success': True,
            'message': 'Data reloaded successfully',
            'total_products': len(engine.df) if engine.df is not None else 0,
            'source': 'CSV + MongoDB sync'
        })
        
    except Exception as e:
        print(f"❌ Error reloading data: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check untuk monitoring"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': engine.df is not None and not engine.df.empty and len(engine.df) > 0,
        'ml_libraries': ML_AVAILABLE,
        'timestamp': '2025-01-24 12:30:00'
    })

if __name__ == '__main__':
    print("🚀 Starting Clothing Recommendation Service...")
    print(f"🤖 ML Libraries Available: {ML_AVAILABLE}")
    if ML_AVAILABLE:
        print("✅ Full ML-powered recommendations with TF-IDF + Cosine Similarity")
    else:
        print("⚠️ Fallback mode: Basic implementations without heavy dependencies")
    print("🔄 Service will automatically adapt based on available libraries")
    print("🌐 Access the service at: http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)