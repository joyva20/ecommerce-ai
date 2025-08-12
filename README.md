# 🛍️ Full-Stack E-commerce Platform with AI Recommendations

A modern, feature-rich e-commerce platform for clothing retail with intelligent product recommendations powered by machine learning algorithms.

## 🌟 Overview

This comprehensive e-commerce solution combines the power of the MERN stack with Python-based AI recommendations to deliver a personalized shopping experience. The platform features a customer-facing storefront, administrative dashboard, and sophisticated recommendation engine that learns from user behavior to suggest relevant products.

## ✨ Key Features

### 🛒 Customer Experience
- **Intelligent Product Recommendations**: AI-powered suggestions based on user behavior and preferences
- **Advanced Search & Filtering**: Smart product discovery with multiple filter options
- **Shopping Cart & Wishlist**: Seamless shopping experience with save-for-later functionality
- **User Reviews & Ratings**: Community-driven product feedback system
- **Order Tracking**: Real-time order status updates and history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔐 Authentication & Security
- **Secure User Authentication**: JWT-based authentication system
- **Profile Management**: Comprehensive user profile with order history
- **Password Security**: Bcrypt encryption for secure password storage

### 💳 Payment & Orders
- **Midtrans Payment Integration**: Secure payment processing
- **Order Management**: Complete order lifecycle management
- **Real-time Updates**: Live order status tracking

### 👨‍💼 Administrative Features
- **Admin Dashboard**: Comprehensive analytics and management interface
- **Product Management**: Full CRUD operations for product catalog
- **Order Management**: Order processing and fulfillment tracking
- **User Management**: Customer account oversight
- **Real-time Analytics**: Dashboard with sales metrics and insights

### 🤖 AI & Machine Learning
- **Recommendation Engine**: Python-based ML algorithms for product suggestions
- **TF-IDF Analysis**: Content-based filtering for product recommendations
- **Behavior Analytics**: User interaction tracking for improved suggestions

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Swiper.js** - Touch slider for product galleries
- **React Toastify** - Notification system

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and optimization
- **Midtrans** - Payment gateway integration

### AI/ML Service
- **Python 3.8+** - Programming language
- **Flask** - Micro web framework
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning library
- **TF-IDF** - Text analysis for recommendations

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-reload
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- npm or pnpm package manager

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/joyva20/ecommerce-ai.git
   cd FullStack-Ecommerce-Clothing
   ```

2. **Setup Python Environment & AI Service**
   ```bash
   cd recommendation-service
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   cd ..
   ```

3. **Install Node.js Dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   cd ..
   
   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Admin panel dependencies
   cd admin
   npm install
   cd ..
   ```

4. **Environment Configuration**

   Create `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce-ai
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   MIDTRANS_SERVER_KEY=your-midtrans-server-key
   MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-admin-password
   ```

   Create `.env` file in the `recommendation-service` directory:
   ```env
   FLASK_ENV=development
   BACKEND_URL=http://localhost:4000
   ```

5. **Database Setup**
   ```bash
   # Make sure MongoDB is running
   # The application will create necessary collections automatically
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start All Services** (Recommended for development)
   ```bash
   # Use the provided batch script (Windows)
   start-all.bat
   
   # Or start services individually:
   ```

2. **Start Services Individually**
   ```bash
   # Terminal 1: Backend Server
   cd backend
   npm run server
   
   # Terminal 2: Frontend Development Server
   cd frontend
   npm run dev
   
   # Terminal 3: Admin Panel
   cd admin
   npm run dev
   
   # Terminal 4: AI Recommendation Service
   cd recommendation-service
   python app.py
   ```

### Production Mode

```bash
# Build frontend and admin
cd frontend && npm run build && cd ..
cd admin && npm run build && cd ..

# Start backend in production
cd backend && npm start
```

## 🌐 Application URLs

- **Frontend (Customer)**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **Backend API**: http://localhost:4000
- **AI Recommendation Service**: http://localhost:5000

## 📁 Project Structure

```
FullStack-Ecommerce-Clothing/
├── 📁 backend/                 # Express.js API server
│   ├── 📁 config/             # Database and service configurations
│   ├── 📁 controllers/        # API route handlers
│   ├── 📁 middleware/         # Authentication and validation
│   ├── 📁 models/             # MongoDB data models
│   ├── 📁 routes/             # API route definitions
│   └── server.js              # Main server file
├── 📁 frontend/               # React customer interface
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable React components
│   │   ├── 📁 pages/          # Page components
│   │   └── 📁 assets/         # Static assets
│   └── package.json
├── 📁 admin/                  # React admin dashboard
│   ├── 📁 src/
│   │   ├── 📁 components/     # Admin UI components
│   │   └── 📁 pages/          # Admin pages
│   └── package.json
├── 📁 recommendation-service/ # Python ML service
│   ├── 📁 models/             # ML models and algorithms
│   ├── 📁 data/               # Training data and datasets
│   ├── app.py                 # Flask application
│   └── requirements.txt
└── 📁 recycle-bin/           # Archived documentation
    └── 📁 md/                # Moved markdown files
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/admin/login` - Admin login

### Product Endpoints
- `GET /api/product/list` - Get all products
- `POST /api/product/add` - Add new product (Admin)
- `PUT /api/product/update/:id` - Update product (Admin)
- `DELETE /api/product/remove/:id` - Remove product (Admin)

### Order Endpoints
- `POST /api/order/place` - Place new order
- `GET /api/order/list` - Get user orders
- `GET /api/order/status/:id` - Get order status

### Recommendation Endpoints
- `GET /api/recommendations/user/:userId` - Get personalized recommendations
- `POST /api/recommendations/train` - Retrain ML models

## 🤖 AI Recommendation System

The recommendation engine uses multiple algorithms:

1. **Content-Based Filtering**: TF-IDF analysis of product descriptions
2. **Collaborative Filtering**: User behavior pattern analysis
3. **Hybrid Approach**: Combination of both methods for optimal results

### Training the Model
```bash
cd recommendation-service
python train_model.py
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# ML service tests
cd recommendation-service
python -m pytest tests/
```

## 📊 Features Demo

1. **Customer Journey**: Browse products → Add to cart → Checkout → Track order
2. **Admin Management**: Product management → Order processing → Analytics
3. **AI Recommendations**: Personalized suggestions based on user behavior

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Joyva20** - [GitHub Profile](https://github.com/joyva20)

## 🙏 Acknowledgments

- React community for excellent documentation
- Scikit-learn for ML algorithms
- MongoDB for flexible database solutions
- Midtrans for payment gateway integration

---

⭐ If you found this project helpful, please give it a star!




