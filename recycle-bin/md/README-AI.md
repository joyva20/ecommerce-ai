# E-commerce with AI Recommendations

Full-stack e-commerce platform with Python-powered AI recommendation system.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB

### Installation

1. **Clone and setup the project:**
```bash
git clone <your-repo-url>
cd FullStack-Ecommerce-Clothing
```

2. **Install Python dependencies:**
```bash
cd recommendation-service
pip install -r requirements.txt
cd ..
```

3. **Install Node.js dependencies:**
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Admin
cd admin
npm install
cd ..
```

4. **Setup Environment Variables:**

Backend `.env`:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Recommendation Service `.env`:
```
MONGO_URI=mongodb://localhost:27017/ecommerce
```

### Running the Application

**Option 1: Use the batch script (Windows):**
```bash
start-all.bat
```

**Option 2: Start services manually:**

1. **Start MongoDB** (make sure it's running)

2. **Start Recommendation Service:**
```bash
cd recommendation-service
python app.py
```

3. **Start Backend:**
```bash
cd backend
npm start
```

4. **Start Frontend:**
```bash
cd frontend
npm run dev
```

5. **Start Admin Panel:**
```bash
cd admin
npm run dev
```

## 🎯 Services

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5174  
- **Backend API**: http://localhost:4000
- **AI Recommendations**: http://localhost:5001

## 🤖 AI Recommendation Features

### Content-Based Filtering
- Analyzes product features (name, category, description, etc.)
- Uses TF-IDF vectorization and cosine similarity
- Provides similarity scores for recommended products

### API Endpoints

**Get Similar Products:**
```
GET /api/recommendations/similar/{productId}?limit=5
```

**Get Category Recommendations:**
```
GET /api/recommendations/category/{category}?limit=10
```

**Refresh Recommendation Data:**
```
POST /api/recommendations/refresh
```

## 🔧 How It Works

1. **Python Service** analyzes product data from MongoDB
2. **TF-IDF Vectorization** creates feature vectors from product text
3. **Cosine Similarity** calculates product relationships
4. **Node.js Backend** proxies requests to Python service
5. **React Frontend** displays AI-powered recommendations

## 🎨 Frontend Integration

Add recommendations to any React component:

```jsx
import ProductRecommendations from './components/ProductRecommendations';

// Similar products
<ProductRecommendations 
  productId="product123" 
  type="similar" 
  limit={5} 
/>

// Category recommendations
<ProductRecommendations 
  category="Men" 
  type="category" 
  limit={10} 
/>
```

## 📊 Architecture

```
Frontend (React) → Backend (Node.js) → AI Service (Python) → MongoDB
                                    ↘                      ↗
                                      Feature Processing
```

## 🛠️ Technologies

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI Service**: Python, Flask, scikit-learn, pandas
- **Database**: MongoDB
- **ML Libraries**: scikit-learn, pandas, numpy

## 📈 Future Enhancements

- Collaborative filtering
- Real-time recommendations
- A/B testing for recommendation algorithms
- User behavior tracking
- Deep learning models (TensorFlow/PyTorch)
