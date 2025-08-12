// Test script for persistent random order functionality
console.log('🧪 Testing Persistent Random Order System...\n');

// Mock data
const mockProducts = [
  { _id: 'prod1', name: 'T-Shirt 1' },
  { _id: 'prod2', name: 'T-Shirt 2' },
  { _id: 'prod3', name: 'Jeans 1' },
  { _id: 'prod4', name: 'Jacket 1' },
  { _id: 'prod5', name: 'Dress 1' }
];

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken';

// Import the functions (would need to be adjusted for actual testing)
// import { getRandomOrder, clearRandomOrder } from './randomOrder.js';

// Simulate the functions locally for testing
const getSessionKey = (token) => {
  if (!token) return null;
  const sessionId = btoa(token.slice(-10)).replace(/[=+/]/g, '').slice(0, 8);
  return `collection_order_${sessionId}`;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const mockGetRandomOrder = (products, token) => {
  console.log('🎲 mockGetRandomOrder called with:', {
    productsCount: products.length,
    hasToken: !!token
  });

  if (!token || !products.length) return products;

  const sessionKey = getSessionKey(token);
  if (!sessionKey) return products;

  try {
    const storedOrder = localStorage.getItem(sessionKey);
    
    if (storedOrder) {
      console.log('🎲 Found existing random order');
      const storedIds = JSON.parse(storedOrder);
      const productMap = new Map(products.map(p => [p._id, p]));
      const orderedProducts = [];
      
      storedIds.forEach(id => {
        if (productMap.has(id)) {
          orderedProducts.push(productMap.get(id));
          productMap.delete(id);
        }
      });
      
      productMap.forEach(product => orderedProducts.push(product));
      return orderedProducts;
    } else {
      console.log('🎲 Creating new random order');
      const randomizedProducts = shuffleArray(products);
      const productIds = randomizedProducts.map(p => p._id);
      localStorage.setItem(sessionKey, JSON.stringify(productIds));
      return randomizedProducts;
    }
  } catch (error) {
    console.error('🎲 Error:', error);
    return products;
  }
};

const mockClearRandomOrder = (token) => {
  if (!token) return;
  const sessionKey = getSessionKey(token);
  if (sessionKey) {
    localStorage.removeItem(sessionKey);
    console.log('🎲 Cleared random order');
  }
};

// Test scenarios
console.log('📋 Test 1: First login - should create new random order');
const firstOrder = mockGetRandomOrder(mockProducts, mockToken);
console.log('First order:', firstOrder.map(p => p.name));

console.log('\n📋 Test 2: Same session - should return same order');
const secondOrder = mockGetRandomOrder(mockProducts, mockToken);
console.log('Second order:', secondOrder.map(p => p.name));
console.log('Orders match:', JSON.stringify(firstOrder) === JSON.stringify(secondOrder));

console.log('\n📋 Test 3: Logout and login again - should create new random order');
mockClearRandomOrder(mockToken);
const thirdOrder = mockGetRandomOrder(mockProducts, mockToken);
console.log('Third order (after logout):', thirdOrder.map(p => p.name));
console.log('Different from first:', JSON.stringify(firstOrder) !== JSON.stringify(thirdOrder));

console.log('\n📋 Test 4: Same session again - should be persistent');
const fourthOrder = mockGetRandomOrder(mockProducts, mockToken);
console.log('Fourth order:', fourthOrder.map(p => p.name));
console.log('Matches third order:', JSON.stringify(thirdOrder) === JSON.stringify(fourthOrder));

console.log('\n✅ Tests completed!');

// Test with browser environment
if (typeof window !== 'undefined') {
  console.log('\n🌐 Browser environment detected');
  console.log('localStorage available:', typeof localStorage !== 'undefined');
  
  // Show current localStorage keys
  const keys = Object.keys(localStorage);
  const collectionKeys = keys.filter(key => key.startsWith('collection_order_'));
  console.log('Collection order keys in localStorage:', collectionKeys);
}
