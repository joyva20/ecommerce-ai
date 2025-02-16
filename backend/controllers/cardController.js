import userModel from "../models/userModel.js";
// Add products to user cart
const addToCart = async (req, res) => {
  try {
    const { userID, itemid, size } = req.body;
    const userData = await userModel.findById(userID);
    let cartData = await userData.cartData;
    if (cartData[itemid])
      if (cartData[itemid][size]) {
        cartData[itemid][size]++;
      } else {
        cartData[itemid][size] = 1;
      }
    else {
      cartData[itemid] = {};
      cartData[itemid][size] = 1;
    }
    // Update the user's cart data in the database
    await userModel.findByIdAndUpdate(userID, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Update user cart
const updateCart = async (req, res) => {
  try {
    const { userID, itemid, size, quantity } = req.body;
    const userData = await userModel.findById(userID);
    let cartData = await userData.cartData;
    cartData[itemid][size] = quantity;
    // Update the user's cart data in the database
    await userModel.findByIdAndUpdate(userID, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
// Get User Cart Data
const getUserCart = async (req, res) => {
  try {
    const { userID } = req.body;
    const userData = await userModel.findById(userID);
    console.log(userData)
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
