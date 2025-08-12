// Edit user (name, email)
const editUser = async (req, res) => {
  try {
    const { id, name, email } = req.body;
    if (!id) return res.json({ success: false, message: "User ID required" });  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body; update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    await userModel.findByIdAndUpdate(id, update);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// Ambil semua user (untuk admin)
const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

// Define a function to create a JSON Web Token (JWT) using the user's ID
const createToken = (id) => {
  // Use the jwt.sign method to create a token, including the user ID in the payload
  // The token is signed with the secret key stored in the environment variable JWT_SECRET
  // "signing" refers to the process of creating a digital signature for a token using a secret key.
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
  );
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "User with this email doesn't exist",
      });
    /*
      The bcrypt.compare function internally hashes the plain text password
      using the same salt and algorithm that was used to create the original
      hashed password.
      It then compares the newly generated h ash with the stored hash.
      */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({
        success: false,
        message: "Invalid credentials.",
      });
    else {
      const token = createToken(user._id);
      return res.json({
        success: true,
        token,
      });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Route for user Register
const registerUser = async (req, res) => {
  // res.json({msg:"Register API Working"})
  try {
    const { name, email, password } = req.body;
    // Checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({
        success: false,
        message: "User with this email already exists",
      });

    // Validating the email format using the validator library
    if (!validator.isEmail(email))
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    // Validating password strength using the validator library and ensuring it is longer than 8 characters
    /**
             * isStrongPassword(str [, options])
             * check if the string can be considered a strong password or not. Allows for custom requirements or scoring rules. If returnScore is true, then the function returns an integer score for the password rather than a boolean.
                Default options:
                { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }
             */
    // res.send(`IS Not Strong Password? ${!validator.isStrongPassword(password)}`)
    if (!validator.isStrongPassword(password) || password.length < 8)
      return res.json({
        success: false,
        message: "Please enter a strong password (minimum 8 characters)",
      });
    //   Hashing user Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // res.send(`hashedPassword:\n ${hashedPassword}`)

    // Create a new user instance with the provided name, email, and hashed password
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    // Save the new user instance to the database,
    // in user const, we get a unique user _id
    const user = await newUser.save();
    const token = createToken(user._id);
    // Send a JSON response to the client indicating success and including the generated token
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials." });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for forgot password - verify user by email and username
const forgotPassword = async (req, res) => {
  try {
    const { email, username } = req.body;
    
    // Check if both email and username are provided
    if (!email || !username) {
      return res.json({ 
        success: false, 
        message: "Both email and username are required" 
      });
    }

    // Check if any users exist at all (for debugging)
    const totalUsers = await userModel.countDocuments();
    
    if (totalUsers === 0) {
      return res.json({ 
        success: false, 
        message: "No users found in database. Please register first." 
      });
    }

    // Find user by email and name (username) - case insensitive
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      name: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: `No user found with email "${email}" and username "${username}". Please check your credentials.` 
      });
    }

    // Generate a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ 
      success: true, 
      message: "User verified successfully. You can now reset your password.",
      resetToken,
      userId: user._id
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Route for reset password with token
const resetPassword = async (req, res) => {
  try {
    console.log("Reset password request received:", req.body);
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.json({ 
        success: false, 
        message: "Reset token and new password are required" 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.json({ 
        success: false, 
        message: "Invalid or expired reset token" 
      });
    }

    // Validate new password strength
    if (!validator.isStrongPassword(newPassword) || newPassword.length <= 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password (min 8 characters with uppercase, lowercase, number, and symbol)",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await userModel.findByIdAndUpdate(decoded.userId, {
      password: hashedPassword
    });

    res.json({ 
      success: true, 
      message: "Password reset successfully! You can now login with your new password." 
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// Hapus user
const removeUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ success: false, message: "User ID required" });
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, removeUser, listUsers, editUser, forgotPassword, resetPassword };
