# Google Colab Integration Guide

## 📚 Workflow untuk Training di Google Colab

### 1. **Upload ke Colab**
- Upload `recommendation_training.ipynb` ke Google Colab
- Atau buat notebook baru dan copy-paste cell-nya

### 2. **Setup di Colab**
```python
# Mount Google Drive (optional, untuk save model)
from google.colab import drive
drive.mount('/content/drive')

# Install packages
!pip install pymongo python-dotenv

# Upload data atau connect ke MongoDB
# Option 1: Upload CSV file
from google.colab import files
uploaded = files.upload()

# Option 2: Connect to MongoDB Atlas (recommended)
import pymongo
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/ecommerce"
```

### 3. **Training Process**
- Jalankan semua cell di notebook
- Model akan di-train dan di-evaluate
- Hasil training:
  - `tfidf_vectorizer.pkl`
  - `cosine_similarity_matrix.npy` 
  - `processed_products.csv`
  - `evaluation_results.json`

### 4. **Download Models**
```python
# Download trained models dari Colab
from google.colab import files

files.download('tfidf_vectorizer.pkl')
files.download('cosine_similarity_matrix.npy')
files.download('processed_products.csv')
files.download('evaluation_results.json')
```

### 5. **Deployment ke Local**
1. Download semua file model dari Colab
2. Letakkan di folder:
   ```
   recommendation-service/
   ├── models/
   │   ├── tfidf_vectorizer.pkl
   │   ├── cosine_similarity_matrix.npy
   │   ├── evaluation_results.json
   │   └── model_metadata.json
   ├── data/
   │   └── processed_products.csv
   └── app.py
   ```

## 🔄 Hybrid Approach (Recommended)

Update `app.py` untuk menggunakan pre-trained model jika ada:

```python
from optimized_engine import OptimizedRecommendationEngine

# Initialize both engines
rec_engine = RecommendationEngine()  # Original
optimized_engine = OptimizedRecommendationEngine()  # Pre-trained

@app.route('/recommendations/similar/<product_id>', methods=['GET'])
def get_similar_products(product_id):
    try:
        # Try optimized engine first (pre-trained)
        if optimized_engine.similarity_matrix is not None:
            recommendations = optimized_engine.get_recommendations(product_id, num_recs)
        else:
            # Fallback to real-time computation
            recommendations = rec_engine.get_recommendations(product_id, num_recs)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'method': 'pre-trained' if optimized_engine.similarity_matrix is not None else 'real-time'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## 🚀 Benefits

### Pre-trained Model (dari Colab):
- ✅ **Faster**: Pre-computed similarity matrix
- ✅ **Better**: Training dengan full dataset
- ✅ **Stable**: Consistent results
- ✅ **Advanced**: Bisa pakai deep learning

### Real-time (Fallback):
- ✅ **Fresh**: Always up-to-date dengan data baru  
- ✅ **Dynamic**: Handle new products immediately
- ✅ **No Dependency**: Tidak perlu file model

## 📋 Struktur Folder Final

```
recommendation-service/
├── notebooks/           # Training notebooks
│   └── recommendation_training.ipynb
├── models/             # Pre-trained models dari Colab
│   ├── tfidf_vectorizer.pkl
│   ├── cosine_similarity_matrix.npy
│   ├── evaluation_results.json
│   └── model_metadata.json
├── data/               # Processed data
│   └── processed_products.csv
├── app.py              # Flask API (hybrid)
├── optimized_engine.py # Pre-trained model loader
├── requirements.txt
└── .env
```

## 🎯 Next Steps

1. **Training di Colab**: Buka `recommendation_training.ipynb` di Google Colab
2. **Experiment**: Try different algorithms (deep learning, collaborative filtering)
3. **Download Models**: Save trained models ke local
4. **Deploy**: Jalankan hybrid system dengan pre-trained + real-time
5. **Monitor**: Track recommendation performance dan retrain berkala

Apakah Anda ingin saya jelaskan bagian tertentu atau ada yang ingin dimodifikasi?
