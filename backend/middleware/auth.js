import jwt from "jsonwebtoken";

const authUser = async (req, res, callback) => {
  const { token } = req.headers;
  console.log('Auth middleware - token received:', token ? 'yes' : 'no');
  
  if (!token) {
    console.log('No token provided');
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }
  try {
    // This line of code verifies the JWT (JSON Web Token) provided in the 'token' variable
    // It uses the secret key stored in the environment variable 'JWT_SECRET' to decode the token
    // The decoded token, which contains the user's information, is stored in the 'token_decode' variable
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', token_decode);
    
    req.body.userID = token_decode.id;
    console.log('UserID set in request:', req.body.userID);
    
    callback();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
