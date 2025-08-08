/**
 * Script untuk migrasi kategori produk dari:
 * - Topwear → Top Wear
 * - Bottomwear → Bottom Wear  
 * - Winterwear → Top & Bottom Wear
 */

const { MongoClient } = require('mongodb');

// Ganti dengan connection string MongoDB Anda
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forever';

async function migrateCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('products');
    
    // Mapping kategori lama ke baru
    const categoryMapping = {
      'Topwear': 'Top Wear',
      'Bottomwear': 'Bottom Wear',
      'Winterwear': 'Top & Bottom Wear'
    };
    
    // Update setiap kategori
    for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
      const result = await collection.updateMany(
        { subCategory: oldCategory },
        { $set: { subCategory: newCategory } }
      );
      
      console.log(`📝 Updated ${result.modifiedCount} products from "${oldCategory}" to "${newCategory}"`);
    }
    
    // Tampilkan summary setelah migrasi
    console.log('\n📊 Summary setelah migrasi:');
    const categoryCounts = await collection.aggregate([
      {
        $group: {
          _id: '$subCategory',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    categoryCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} products`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.close();
  }
}

// Jalankan migrasi
migrateCategories();
