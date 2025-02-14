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
    process.env.JWT_SECRET
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
    if (!validator.isStrongPassword(password) || password.length <= 8)
      return res.json({
        success: false,
        message: "Please enter a strong password",
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
export { loginUser, registerUser, adminLogin };
