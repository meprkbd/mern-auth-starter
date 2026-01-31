import mongoose from "mongoose";
import { config } from "../config/app.config.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`Database connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      "Error connecting to database:",
      error instanceof Error ? error.message : "Unknown error",
    );
    process.exit(1);
  }
};

export default connectDB;
