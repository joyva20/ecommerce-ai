// Utility functions for persistent random order per user session

// Generate a unique session key based on user token
const getSessionKey = (token) => {
  if (!token) return null;
  // Create a hash-like string from token for session key
  const sessionId = btoa(token.slice(-10)).replace(/[=+/]/g, '').slice(0, 8);
  return `collection_order_${sessionId}`;
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get or create persistent random order for current session
export const getRandomOrder = (products, token) => {
  console.log('🎲 getRandomOrder called with:', {
    productsCount: products.length,
    hasToken: !!token
  });

  if (!token || !products.length) {
    console.log('🎲 No token or no products, returning original order');
    return products;
  }

  const sessionKey = getSessionKey(token);
  if (!sessionKey) {
    console.log('🎲 Cannot generate session key, returning original order');
    return products;
  }

  try {
    // Try to get existing order from localStorage
    const storedOrder = localStorage.getItem(sessionKey);
    
    if (storedOrder) {
      console.log('🎲 Found existing random order for session');
      const storedIds = JSON.parse(storedOrder);
      
      // Reconstruct the order based on stored IDs
      const orderedProducts = [];
      const productMap = new Map(products.map(p => [p._id, p]));
      
      // Add products in stored order
      storedIds.forEach(id => {
        if (productMap.has(id)) {
          orderedProducts.push(productMap.get(id));
          productMap.delete(id);
        }
      });
      
      // Add any new products that weren't in the stored order
      productMap.forEach(product => {
        orderedProducts.push(product);
      });
      
      console.log('🎲 Reconstructed order with', orderedProducts.length, 'products');
      return orderedProducts;
    } else {
      console.log('🎲 No existing order found, creating new random order');
      
      // Generate new random order
      const randomizedProducts = shuffleArray(products);
      
      // Store the order of IDs in localStorage
      const productIds = randomizedProducts.map(p => p._id);
      localStorage.setItem(sessionKey, JSON.stringify(productIds));
      
      console.log('🎲 Created and stored new random order for session');
      return randomizedProducts;
    }
  } catch (error) {
    console.error('🎲 Error managing random order:', error);
    return products;
  }
};

// Clear random order (called on logout)
export const clearRandomOrder = (token) => {
  if (!token) return;
  
  const sessionKey = getSessionKey(token);
  if (sessionKey) {
    localStorage.removeItem(sessionKey);
    console.log('🎲 Cleared random order for session');
  }
};

// Clear all random orders (cleanup function)
export const clearAllRandomOrders = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('collection_order_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🎲 Cleared all random orders');
};
