import express from "express";
import multer from "multer";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware otentikasi universal (ambil user dari token di header/cookie)
const authUser = async (req, res, next) => {
  let token = req.headers.token || req.headers.authorization;
  if (!token && req.cookies) token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not Authorized. Login Again." });
  try {
    if (token.startsWith("Bearer ")) token = token.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET user profile
router.get('/profile', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST upload/change profile photo
router.post('/upload-photo', authUser, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    await User.findByIdAndUpdate(req.user.id, { photo: photoUrl });
    res.json({ message: 'Photo updated', photo: photoUrl });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST change password
router.post('/change-password', authUser, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password too short' });
    const hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hash });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE user account
router.delete('/delete', authUser, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
