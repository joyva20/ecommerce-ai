# 🎯 Testing Complete Workflow: Admin Add Product → Shop Display → Recommendations

## 📋 Setup Steps

### 1. Start All Services
```bash
# Terminal 1: Start MongoDB (jika belum jalan)
mongod

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Recommendation Service  
cd recommendation-service
python app.py

# Terminal 4: Start Admin Panel
cd admin
npm start

# Terminal 5: Start Frontend Shop
cd frontend
npm start
```

### 2. URLs yang akan dibuka:
- **Admin Panel**: http://localhost:5174
- **Shop Frontend**: http://localhost:5173  
- **Backend API**: http://localhost:4000
- **Recommendation API**: http://localhost:5001

## 🧪 Testing Workflow

### Step 1: Add Product via Admin Panel
1. Buka **http://localhost:5174**
2. Login ke admin panel
3. Go to "Add Items" 
4. Upload produk baru dengan:
   - **Name**: "Blazer Elegan Wanita Premium"
   - **Description**: "Blazer premium untuk wanita dengan bahan berkualitas tinggi"
   - **Price**: 299000
   - **Category**: "Women"  
   - **Sub Category**: "Topwear"
   - **Sizes**: ["S", "M", "L", "XL"]
   - **Upload images**
5. Click "ADD"

### Step 2: Verify Auto-Sync to Recommendation Service
```bash
# Check recommendation service logs
# Should see: ✅ Synced X products to recommendation service

# Test API directly
curl http://localhost:5001/
# Should show updated total_products count
```

### Step 3: View Product in Shop
1. Buka **http://localhost:5173**
2. Go to collection atau shop page
3. **Verify**: Produk baru "Blazer Elegan Wanita Premium" muncul di listing

### Step 4: Test Recommendations
1. Add produk ke cart
2. Go to checkout/cart page  
3. **Verify**: "You might also like" section shows recommendations
4. Check similarity scores untuk produk blazer lainnya

### Step 5: Test dengan Multiple Products
1. Add 2-3 produk lagi via admin:
   - "Kemeja Kasual Pria"
   - "Dress Party Wanita"
   - "Celana Jeans Slim Fit"
2. **Verify**: Semua muncul di shop
3. **Test**: Recommendations berubah berdasarkan kategori

## 🔍 API Testing Commands

### Test Recommendation Service
```bash
# 1. Check service status
curl http://localhost:5001/

# 2. Test similar products  
curl -X POST http://localhost:5001/recommendations/similar \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Blazer Elegan"}'

# 3. Test category recommendations
curl http://localhost:5001/recommendations/category/women/type/topwear

# 4. Manual data reload (if needed)
curl -X POST http://localhost:5001/reload
```

### Test Backend Integration
```bash
# 1. Get all products
curl http://localhost:4000/api/product/list

# 2. Test checkout recommendations
curl -X POST http://localhost:4000/api/recommendations/checkout \
  -H "Content-Type: application/json" \
  -d '{"cartItems": ["Blazer Elegan", "Kemeja"]}'
```

## ✅ Expected Results

### ✅ Admin Panel:
- Product berhasil ditambahkan
- Images ter-upload ke Cloudinary
- Success message muncul

### ✅ Backend:
- Product tersimpan di MongoDB
- Auto-sync ke recommendation service
- Log: "✅ Synced X products to recommendation service"

### ✅ Recommendation Service:
- Product count bertambah
- TF-IDF model rebuilt otomatis
- Similarity calculation updated

### ✅ Frontend Shop:
- Produk baru muncul di collection
- Images ter-display dengan benar
- Price, description, sizes tersedia

### ✅ Checkout Recommendations:
- "You might also like" section aktif
- Shows relevant products based on cart
- Similarity scores ditampilkan
- Add to cart functionality working

## 🐛 Troubleshooting

### If recommendation service tidak sync:
```bash
# Manual reload
curl -X POST http://localhost:5001/reload

# Check service logs for errors
```

### If produk tidak muncul di shop:
- Check MongoDB connection
- Verify backend API: `curl http://localhost:4000/api/product/list`
- Refresh frontend page

### If recommendations tidak akurat:
- Pastikan product names menggunakan bahasa yang konsisten
- Check TF-IDF model building di logs
- Test dengan produk yang kategorinya jelas berbeda

## 🎯 Success Criteria:
1. ✅ Dapat add produk via admin panel
2. ✅ Produk muncul di shop frontend  
3. ✅ Recommendation service auto-update
4. ✅ Checkout page shows "You might also like"
5. ✅ Similarity scores akurat berdasarkan kategori
6. ✅ ML algorithm memberikan recommendations yang relevan

Ready untuk testing! 🚀
