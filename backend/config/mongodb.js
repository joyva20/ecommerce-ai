import mongoose from "mongoose";

const connectDB = async () => {
  // Set up an event listener for when the connection is successfully established
  mongoose.connection.on("connected", () => {
    console.log("MongoDB Connected");
  });
  // Connect to the MongoDB database using the connection string from environment variables
  await mongoose.connect(process.env.MONGODB_URI);
};
export default connectDB;
