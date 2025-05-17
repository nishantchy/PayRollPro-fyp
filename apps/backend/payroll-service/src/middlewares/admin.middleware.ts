import { Request, Response, NextFunction } from "express";
import Customer from "../models/customer.model";
import mongoose from "mongoose";

/**
 * Middleware to check if the user is an admin
 * Requires auth middleware to be applied first for req.user to be available
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if req.user exists (auth middleware should have set this)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Check if user is an admin
    if (!(req.user as any).isAdmin) {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
      return;
    }

    // User is authenticated and is an admin
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking admin permissions",
    });
  }
};

/**
 * Middleware to check if the user is an admin or the user with the specified ID
 * Used for routes where a user can access their own resources
 * Requires auth middleware to be applied first for req.user to be available
 */
export const isAdminOrSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if req.user exists (auth middleware should have set this)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const userId = (req.user as any).id;
    const isUserAdmin = (req.user as any).isAdmin;
    const requestedId = req.params.id;

    // Allow if user is admin
    if (isUserAdmin) {
      next();
      return;
    }

    // Allow if user is accessing their own resource by direct ID match
    if (userId === requestedId) {
      next();
      return;
    }

    // If it's a valid MongoDB ObjectId, check if it matches the user's customer document
    if (mongoose.Types.ObjectId.isValid(requestedId)) {
      // Check if this MongoDB ID belongs to the current user
      const customer = await Customer.findById(requestedId);
      if (customer && customer._id.toString() === userId) {
        next();
        return;
      }
    }

    // For customer_id format (e.g., CUSTOMER001), check if it belongs to the user
    if (requestedId.match(/^CUSTOMER\d+$/i)) {
      const customer = await Customer.findOne({ customer_id: requestedId });
      if (customer && customer._id.toString() === userId) {
        next();
        return;
      }
    }

    // If we get here, the user is not authorized
    res.status(403).json({
      success: false,
      message: "Not authorized to access this resource",
    });
  } catch (error) {
    console.error("Permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking permissions",
    });
  }
};
