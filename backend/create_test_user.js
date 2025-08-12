// Create test user for forgot password testing
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.model('user', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');
    
    // List all existing users first
    const allUsers = await User.find({}, { password: 0 });
    console.log('Existing users:', allUsers);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.name, existingUser.email);
      return;
    }
    
    // Create test user with known credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestPassword123!', salt);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Username: Test User');
    console.log('Password: TestPassword123!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
