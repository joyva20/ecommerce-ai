/**
 * Test Script untuk No Size Product Add to Cart
 * 
 * Issue: Dialog "Please select a size" muncul untuk produk No Size
 * 
 * Expected Flow:
 * 1. User buka product detail untuk produk No Size (kaos kaki)
 * 2. Size otomatis ter-set ke "No Size" 
 * 3. Section "Select Size" tidak ditampilkan
 * 4. User klik "ADD TO CART"
 * 5. Product berhasil ditambahkan ke cart tanpa error
 */

console.log('🧪 Test Instructions for No Size Product:');
console.log('');
console.log('1. 📱 Buka product detail kaos kaki');
console.log('2. 🔍 Check console logs untuk debug info');
console.log('3. 👀 Pastikan tidak ada "Select Size" section');
console.log('4. 🛒 Klik "ADD TO CART"');
console.log('5. ✅ Expected: Success toast, no error dialog');
console.log('');
console.log('🔍 Debug checklist:');
console.log('- Product sizes should be: ["No Size"]');
console.log('- isNoSizeProduct should return: true');
console.log('- size state should be: "No Size"');
console.log('- selectedSize should be: "No Size"');
console.log('- No size validation error should occur');

// Test function to run in browser console
window.debugNoSizeProduct = () => {
  console.log('🧦 Debugging No Size Product...');
  
  // Check if we're on product page
  const urlParts = window.location.pathname.split('/');
  if (urlParts[1] !== 'product') {
    console.log('❌ Not on product page');
    return;
  }
  
  console.log('✅ On product page');
  console.log('📍 URL:', window.location.href);
  
  // Look for size buttons
  const sizeButtons = document.querySelectorAll('button');
  const sizeSection = Array.from(sizeButtons).find(btn => 
    btn.textContent.includes('S') || 
    btn.textContent.includes('M') || 
    btn.textContent.includes('L')
  );
  
  if (sizeSection) {
    console.log('❌ Size selection found - might not be No Size product');
  } else {
    console.log('✅ No size selection found - likely No Size product');
  }
  
  // Look for "One size fits all" text
  const oneSizeText = document.body.textContent.includes('One size fits all');
  console.log('👕 "One size fits all" text found:', oneSizeText);
  
  // Look for ADD TO CART button
  const addToCartBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('ADD TO CART')
  );
  console.log('🛒 ADD TO CART button found:', !!addToCartBtn);
};
