import jwt from "jsonwebtoken";

const adminAuth = async (req, res, callback) => {
  try {
    // Ambil token dari header Authorization: Bearer <token> atau header token
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }
    if (!token) {
      return res.json({
        success: false,
        message: "Not authorized, Login Again",
      });
    }
    // Decode dan verifikasi token
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({
        success: false,
        message: "Not authorized, Login Again",
      });
    }
    callback();
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
export default adminAuth;
