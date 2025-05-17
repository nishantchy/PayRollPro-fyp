import mongoose from "mongoose";
import config from "./config";

const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(config.mongoUri, {
      dbName: "payroll-service",
    });
    console.log(
      `MongoDB Connected: ${connect.connection.host}, ${connect.connection.name}`
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default dbConnect;
