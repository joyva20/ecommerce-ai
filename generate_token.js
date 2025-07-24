const jwt = require('jsonwebtoken');

// JWT Secret dari .env
const JWT_SECRET = 'mySuperSecretKey123';

// User ID dari log sebelumnya  
const userId = '688081f73efc6bdfc6ebda49';

// Generate token
const token = jwt.sign({ id: userId }, JWT_SECRET);

console.log('Generated Token for User:', userId);
console.log('Token:', token);

// Verify token works
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}
