# 🤖 AI Recommendation Service

## 📋 Overview

Full-featured ML-powered recommendation engine untuk e-commerce clothing website. Service ini menggunakan **TF-IDF + Cosine Similarity** untuk content-based filtering dan membaca data langsung dari file CSV.

## ✨ Key Features

- **📊 Real Data**: Membaca langsung dari `clothing.csv` (111+ produk)
- **🤖 ML Algorithm**: TF-IDF vectorization + Cosine similarity
- **🔄 Fallback System**: Otomatis fallback ke implementasi sederhana jika ML libraries tidak tersedia
- **📈 Performance Grading**: Automatic model evaluation dengan scoring system
- **🌐 REST API**: Complete endpoints untuk frontend integration
- **⚡ Fast Response**: Optimized untuk real-time recommendations

- **Content-Based Filtering**: Recommends products based on product features (name, category, description, etc.)
- **Category Recommendations**: Get popular products from specific categories
- **Real-time Updates**: Refresh recommendation data when products change
- **RESTful API**: Easy integration with existing e-commerce backend

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:
```
MONGO_URI=mongodb://localhost:27017/ecommerce
```

3. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### Get Similar Products
```
GET /recommendations/similar/{productId}?limit=5
```
Returns products similar to the given product based on content features.

### Get Category Products
```
GET /recommendations/category/{category}?limit=10
```
Returns popular products from the specified category.

### Refresh Data
```
POST /recommendations/refresh
```
Refreshes product data and rebuilds recommendation features.

### Health Check
```
GET /health
```
Returns service health status.

## Example Usage

```javascript
// Get similar products
const response = await fetch('http://localhost:5001/recommendations/similar/productId123?limit=5');
const data = await response.json();

// Get category recommendations
const response = await fetch('http://localhost:5001/recommendations/category/Men?limit=10');
const data = await response.json();
```

## Integration with Node.js Backend

Add recommendation endpoints to your existing Express.js backend:

```javascript
// Add to your routes
app.get('/api/recommendations/similar/:productId', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:5001/recommendations/similar/${req.params.productId}?limit=${req.query.limit || 5}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Recommendation service unavailable' });
  }
});
```
