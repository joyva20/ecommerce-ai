import jwt from "jsonwebtoken";

const authUser = async (req, res, callback) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }
  try {
    // This line of code verifies the JWT (JSON Web Token) provided in the 'token' variable
    // It uses the secret key stored in the environment variable 'JWT_SECRET' to decode the token
    // The decoded token, which contains the user's information, is stored in the 'token_decode' variable
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userID = token_decode.id;
    callback();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
