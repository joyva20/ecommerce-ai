// Test script to verify dashboard category mapping
const categoryMapping = {
  'Topwear': 'Top Wear',
  'Bottomwear': 'Bottom Wear', 
  'Winterwear': 'Top & Bottom Wear',
  'Top Wear': 'Top Wear',
  'Bottom Wear': 'Bottom Wear',
  'Top & Bottom Wear': 'Top & Bottom Wear'
};

// Sample product data with old categories
const sampleProducts = [
  { name: "T-Shirt 1", subCategory: "Topwear" },
  { name: "T-Shirt 2", subCategory: "Topwear" },
  { name: "Jeans 1", subCategory: "Bottomwear" },
  { name: "Jeans 2", subCategory: "Bottomwear" },
  { name: "Jacket 1", subCategory: "Winterwear" },
  { name: "Dress 1", subCategory: "Top Wear" },
  { name: "Shorts 1", subCategory: "Bottom Wear" },
  { name: "Set 1", subCategory: "Top & Bottom Wear" }
];

console.log('🧪 Testing Dashboard Category Mapping...\n');

// Test the mapping logic
const productsByType = sampleProducts.reduce((acc, product) => {
  let type = product.subCategory || 'Untyped';
  const originalType = type;
  type = categoryMapping[type] || type;
  
  if (originalType !== type) {
    console.log(`📊 Mapped "${originalType}" → "${type}"`);
  }
  
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

console.log('\n📊 Final Dashboard Results:');
console.log(productsByType);

console.log('\n✅ Expected output should show:');
console.log('- Top Wear: 3 (2 from Topwear + 1 from Top Wear)');
console.log('- Bottom Wear: 3 (2 from Bottomwear + 1 from Bottom Wear)'); 
console.log('- Top & Bottom Wear: 2 (1 from Winterwear + 1 from Top & Bottom Wear)');
