// Simple API call untuk migrasi kategori
const BACKEND_URL = 'http://localhost:5001';

async function migrateViaAPI() {
  try {
    console.log('🔄 Starting category migration via API...');
    
    const categoryMapping = {
      'Topwear': 'Top Wear',
      'Bottomwear': 'Bottom Wear',
      'Winterwear': 'Top & Bottom Wear'
    };
    
    for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
      console.log(`📝 Migrating ${oldCategory} → ${newCategory}...`);
      
      const response = await fetch(`${BACKEND_URL}/api/product/migrate-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldCategory,
          newCategory
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${result.message}`);
      } else {
        console.error(`❌ Failed to migrate ${oldCategory}`);
      }
    }
    
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('💥 Migration error:', error);
  }
}

// Test: Fetch current categories
async function checkCurrentCategories() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/product/list`);
    const data = await response.json();
    
    if (data.success) {
      const categories = {};
      data.products.forEach(product => {
        const subCat = product.subCategory;
        categories[subCat] = (categories[subCat] || 0) + 1;
      });
      
      console.log('📊 Current categories in database:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} products`);
      });
    }
  } catch (error) {
    console.error('Error checking categories:', error);
  }
}

// Run checks first
checkCurrentCategories();
