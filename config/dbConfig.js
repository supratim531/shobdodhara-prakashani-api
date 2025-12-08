import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 20,
      socketTimeoutMS: 30000,
    });
    console.log("MongoDB Connected");
    console.log(
      connect.connection.host,
      connect.connection.name,
      connect.connection.models
    );
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
};
