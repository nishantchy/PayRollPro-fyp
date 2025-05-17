import dotenv from "dotenv";
dotenv.config();

// Log the API key for debugging
console.log(
  "API Key from environment:",
  process.env.CORE_SERVICE_API_KEY ? "API key exists" : "API key is missing"
);

const config = {
  // Core service communication
  coreServiceUrl: process.env.CORE_SERVICE_URL || "http://localhost:5000",
  coreServiceApiKey: process.env.CORE_SERVICE_API_KEY,

  // Database
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/payroll-service",

  // Server
  port: process.env.PORT || 5001,

  // JWT
  jwtSecret: process.env.JWT_SECRET || "payroll-service-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
};

export default config;
