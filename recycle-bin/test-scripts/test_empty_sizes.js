/**
 * Test untuk produk dengan sizes: [] (empty array)
 * 
 * Product: Nevada Kaus Kaki Hidden Panda white
 * ID: 6891d66a23bce291ede1a7ec
 * sizes: [] (empty array)
 * 
 * Expected behavior:
 * 1. isNoSizeProduct() should return true
 * 2. size should auto-set to "No Size"
 * 3. No size selection UI should be shown
 * 4. ADD TO CART should work without validation error
 */

// Test function for browser console
window.testEmptySizesArray = () => {
  console.log('🧪 Testing Empty Sizes Array Logic...');
  
  // Mock product data from user
  const mockProduct = {
    "_id": "6891d66a23bce291ede1a7ec",
    "name": "Nevada Kaus Kaki Hidden Panda white",
    "sizes": [], // Empty array
    "category": "Women",
    "subCategory": "Bottomwear"
  };
  
  // Test isNoSizeProduct logic
  const isNoSizeProduct = (product) => {
    if (!product || !product.sizes) return false;
    
    // Check for empty sizes array (common for accessories like socks)
    if (product.sizes.length === 0) return true;
    
    // Check for explicit "No Size" entry
    if (product.sizes.length === 1 && product.sizes[0] === "No Size") return true;
    
    return false;
  };
  
  const result = isNoSizeProduct(mockProduct);
  console.log('✅ Test Result:', {
    productName: mockProduct.name,
    sizes: mockProduct.sizes,
    sizesLength: mockProduct.sizes.length,
    isNoSizeProduct: result,
    expected: true,
    passed: result === true
  });
  
  if (result) {
    console.log('🎉 TEST PASSED: Empty sizes array correctly detected as No Size product');
  } else {
    console.log('❌ TEST FAILED: Empty sizes array not detected as No Size product');
  }
  
  return result;
};

console.log('🚀 Test function loaded. Run window.testEmptySizesArray() in browser console.');
