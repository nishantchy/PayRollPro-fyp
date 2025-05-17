import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware to validate API key for service-to-service communication
 */
export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is missing",
    });
  }

  // Get the valid API keys from environment variables
  const validApiKeys = [
    process.env.SERVICE_API_KEY,
    process.env.PAYROLL_SERVICE_API_KEY,
    // Add other service API keys as needed
  ].filter(Boolean); // Filter out undefined values

  if (!validApiKeys.includes(apiKey as string)) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
};
