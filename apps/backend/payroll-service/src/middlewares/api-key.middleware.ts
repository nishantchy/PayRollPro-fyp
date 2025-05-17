import { Request, Response, NextFunction } from "express";
import config from "../config/config";

/**
 * Middleware to validate API key for service-to-service communication
 */
export const validateApiKey = (
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

  // Define a whitelist of API keys (can be expanded later)
  const validApiKeys = [config.coreServiceApiKey];

  if (!validApiKeys.includes(apiKey as string)) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
};

export default validateApiKey;
