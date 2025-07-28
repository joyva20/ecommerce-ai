import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import userProfileRoute from "./routes/userProfileRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import recommendationRoute from "./routes/recommendationRoute.js";
import adminRoute from "./routes/adminRoute.js";

/**********************************
 ********** App Config ************
 ********************************** */
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

/**********************************
 ********** Middlewares ***********
 ********************************** */
// Use the JSON parser middleware to automatically parse JSON requests
app.use(express.json());
// Acess Backend from any IP
app.use(cors());

/**********************************
 ********* API Endpoints **********
 ********************************** */
// Mount the userRouter at the '/api/user' path, so all routes defined in userRouter will be prefixed with '/api/user'
// Mount the productRouter at the '/api/product' path, so all routes defined in productRouter will be prefixed with '/api/product'
// Mount the cartRouter at the '/api/cart' path, so all routes defined in cartRouter will be prefixed with '/api/cart'
// Mount the orderRouter at the '/api/order' path, so all routes defined in orderRouter will be prefixed with '/api/order'
app.use("/api/user", userRouter);
app.use("/api/user-profile", userProfileRoute);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/recommendations", recommendationRoute);
app.use("/api/admin", adminRoute);
// Define the root endpoint '/' which responds with a simple message to indicate that the API is working
app.get("/", (req, res) => {
  res.send("API is Working");
});
// Start the Express server and listen on the defined port
app.listen(port, () => {
  console.log(`Server started on PORT : ${port}`);
});
