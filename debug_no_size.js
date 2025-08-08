// Debug script untuk melihat produk No Size
window.debugNoSizeProducts = () => {
  console.log('🔍 Debugging No Size Products...');
  
  // Get all ProductItem elements
  const productItems = document.querySelectorAll('[data-product-id]');
  console.log('📦 Total product items found:', productItems.length);
  
  // Look for Quick Add buttons
  const quickAddButtons = document.querySelectorAll('button:contains("Quick Add")');
  console.log('🔘 Quick Add buttons found:', quickAddButtons.length);
  
  // Check products context
  if (window.React) {
    console.log('⚛️ React detected');
  }
  
  console.log('📝 Check console for ProductItem debug logs with "🧦 Debug ProductItem"');
};

// Auto run on page load
setTimeout(() => {
  window.debugNoSizeProducts();
}, 2000);

console.log('🚀 Debug script loaded. Run window.debugNoSizeProducts() manually if needed.');
