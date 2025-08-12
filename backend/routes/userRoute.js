import express from "express";
import userModel from "../models/userModel.js";
import {
  loginUser,
  registerUser,
  adminLogin,
  removeUser,
  listUsers,
  editUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

// Create a new Router object to handle routes related to user operations
const userRouter = express.Router();

// Define the route for user registration which triggers the registerUser function
// Define the route for user login which triggers the loginUser function
// Define the route for admin login which triggers the adminLogin function
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/remove", removeUser);
userRouter.get("/list", listUsers);
userRouter.post("/edit", editUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Debug endpoint to check users
userRouter.get("/debug/users", async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default userRouter;
