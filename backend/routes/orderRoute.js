import express from "express";
import {
  placeOrder,
  placeOrderSepah,
  placeOrderTejarat,
  allOrders,
  userOrders,
  updateStatus,
  removeOrder,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminauth.js";
import authUser from "../middleware/auth.js";

// Create a new Router object to handle routes related to Order operations
const orderRouter = express.Router();

// Admin Features
// Route to list all orders for admin
// Route to update the status of an order for admin
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/remove", adminAuth, removeOrder);

// Payment Features
// Route to place a new order for COD
// Route to place a new order using Sepah payment method
// Route to place a new order using Tejarat payment method
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/sepah", authUser, placeOrderSepah);
orderRouter.post("/tejarat", authUser, placeOrderTejarat);

// User Feature
// Route to list all orders for a specific user
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
