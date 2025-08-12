// Check users in database
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.model('user', userSchema);

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}, { password: 0 });
    console.log('Users in database:');
    console.log(users);
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$dummy.hash.for.testing' // dummy hash
      });
      await testUser.save();
      console.log('Test user created!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers();
