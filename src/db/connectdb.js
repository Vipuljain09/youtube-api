import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {
  try {
    const response = await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@learn-backend.vhlewdg.mongodb.net/${DB_NAME}`
    );
    console.log("MongoDB connected successfully!!");
    return response;
  } catch (error) {
    console.log(error);
  }
};

export default connectdb;
