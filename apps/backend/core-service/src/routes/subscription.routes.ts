import express from "express";
import * as subscriptionController from "../controllers/subscription.controller";
import verifyToken from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/route-utils";
import { checkSubscription } from "../middlewares/subscription.middleware";

const router = express.Router();

/**
 * @route GET /api/subscription/plans
 * @desc Get all available subscription plans
 * @access Public
 */
router.get("/plans", asyncHandler(subscriptionController.getSubscriptionPlans));

// Protected routes - require authentication
router.use(verifyToken);

/**
 * @route GET /api/subscription
 * @desc Get customer's current subscription
 * @access Private
 */
router.get("/", asyncHandler(subscriptionController.getCurrentSubscription));

/**
 * @route POST /api/subscription/upgrade
 * @desc Upgrade customer's subscription to a new plan
 * @access Private
 * @body { plan_id: "basic" | "pro" }
 */
router.post(
  "/upgrade",
  asyncHandler(subscriptionController.upgradeCustomerSubscription)
);

/**
 * @route POST /api/subscription/cancel
 * @desc Cancel customer's current subscription
 * @access Private
 */
router.post(
  "/cancel",
  asyncHandler(subscriptionController.cancelCustomerSubscription)
);

export default router;
