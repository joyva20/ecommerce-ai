// Hapus satu order berdasarkan id
const removeOrder = async (req, res) => {
  try {
    const { orderId, id } = req.body;
    const orderIdToDelete = orderId || id;
    
    if (!orderIdToDelete) {
      return res.json({ success: false, message: "Order ID required" });
    }
    
    const deletedOrder = await orderModel.findByIdAndDelete(orderIdToDelete);
    
    if (!deletedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.json({ success: false, message: error.message });
  }
};
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
// Placing orders using COD method
const placeOrder = async (req, res) => {
  try {
    const { userID, items, amount, address } = req.body;
    console.log("userID:                                " + userID);
    const orderData = {
      userID,
      address,
      items,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();
    await userModel.findByIdAndUpdate(userID, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Placing orders using Sepah method
const placeOrderSepah = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Placing orders using Tejarat method
const placeOrderTejarat = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    // Ambil semua order dari database untuk admin panel
    const orders = await orderModel.find({}).populate('userID', 'name email');
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const { userID } = req.body;
    const orders = await orderModel.find({ userID });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status, statusState } = req.body;
    
    if (!orderId) {
      return res.json({ success: false, message: "Order ID required" });
    }
    
    if (!status) {
      return res.json({ success: false, message: "Status required" });
    }
    
    const updateData = { status };
    if (statusState) {
      updateData.statusState = statusState;
    }
    
    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
    
    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, message: "Status updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Update status error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderSepah,
  placeOrderTejarat,
  allOrders,
  userOrders,
  updateStatus,
  removeOrder,
};
