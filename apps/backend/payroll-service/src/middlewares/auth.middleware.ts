import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Add user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export default authMiddleware;
