import { Request, Response, NextFunction } from "express";

/**
 * Wraps controller functions to make them compatible with Express route handlers
 * This helps handle async errors and resolve TypeScript errors with Express route handler typing
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error("Route handler error:", error);
      res.status(500).json({
        success: false,
        message: (error as Error).message || "Internal server error",
      });
    });
  };
};
