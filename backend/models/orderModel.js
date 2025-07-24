import mongoose from "mongoose";

// Creating order Schema
const orderSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  statusState: { type: String, required: true, default: "info" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
});

// Return the Created order Model or create a new order Model
const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
