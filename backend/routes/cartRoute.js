import express from "express";
import {
  addToCart,
  updateCart,
  getUserCart,
} from "../controllers/cardController.js";
import authUser from "../middleware/auth.js";

// Create a new Router object to handle routes related to user operations
const cartRouter = express.Router();

// This route handles adding an item to the user's cart
// This route handles updating an existing item in the user's cart
// This route handles retrieving the user's cart information
cartRouter.post("/add", authUser, addToCart);
cartRouter.post("/update", authUser, updateCart);
cartRouter.post("/get", authUser, getUserCart);

export default cartRouter;
