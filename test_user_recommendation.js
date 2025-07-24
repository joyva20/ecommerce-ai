// Test script untuk check rekomendasi per user
const jwt = require('jsonwebtoken');

// Generate test token (sesuaikan dengan JWT_SECRET Anda)
const testUserId = "688081f73efc6bdfc6ebda49"; // User ID dari log sebelumnya
const testToken = jwt.sign({ id: testUserId }, "your_jwt_secret_here");

console.log("Test User ID:", testUserId);
console.log("Test Token:", testToken);

// Test payload
const testPayload = {
    cartItems: [
        {
            name: "Nevada Basic Tee Cotton Combed 24S Kaos Lengan Pendek Pria",
            category: "Men", 
            id: "sample123"
        }
    ]
};

console.log("Test Payload:", JSON.stringify(testPayload, null, 2));
console.log("\nCurl command:");
console.log(`curl -X POST "http://localhost:5000/api/recommendations/checkout" \\
  -H "Content-Type: application/json" \\
  -H "token: ${testToken}" \\
  -d '${JSON.stringify(testPayload)}'`);
