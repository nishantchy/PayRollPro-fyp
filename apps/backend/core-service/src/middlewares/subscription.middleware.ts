import { Request, Response, NextFunction } from "express";
import {
  canCreateMoreOrganizations,
  canAddMoreUsers,
  getCustomerSubscription,
  getSubscriptionPlan,
} from "../services/subscription.service";

/**
 * Middleware to check if customer has an active subscription
 * Attaches subscription info to req.user
 */
export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.user.id;

    // Get customer's active subscription
    const subscription = await getCustomerSubscription(customerId);

    if (!subscription) {
      // If no subscription exists, they're still on free plan
      // We still allow them to proceed since we'll check limits in specific middleware
      req.user.subscription = {
        type: "free",
        features: {
          maxOrganizations: 1,
          maxUsersPerOrg: 5,
          prioritySupport: false,
        },
      };
      return next();
    }

    // Get subscription plan details
    const plan = await getSubscriptionPlan(subscription.plan_id);

    if (!plan) {
      // If plan doesn't exist, use free plan limits
      req.user.subscription = {
        type: "free",
        features: {
          maxOrganizations: 1,
          maxUsersPerOrg: 5,
          prioritySupport: false,
        },
      };
      return next();
    }

    // Attach subscription info to req.user
    req.user.subscription = {
      type: plan.plan_id,
      plan,
      features: plan.features,
    };

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    // If there's an error, don't block the request, but log it
    next();
  }
};

/**
 * Middleware to check if customer can create more organizations
 */
export const checkOrganizationLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.user.id;

    // Check if customer can create more organizations
    const canCreate = await canCreateMoreOrganizations(customerId);

    if (!canCreate) {
      return res.status(403).json({
        success: false,
        message:
          "You have reached the maximum number of organizations allowed in your subscription plan",
      });
    }

    next();
  } catch (error) {
    console.error("Organization limit check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking organization limit",
    });
  }
};

/**
 * Middleware to check if organization can add more users
 */
export const checkOrganizationUserLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.user.id;
    const { org_id } = req.body;

    // If no org_id is provided in body, check URL params
    const orgId = org_id || req.params.org_id;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Check if organization can add more users
    const canAdd = await canAddMoreUsers(orgId, customerId);

    if (!canAdd) {
      return res.status(403).json({
        success: false,
        message:
          "You have reached the maximum number of users allowed for this organization in your subscription plan",
      });
    }

    next();
  } catch (error) {
    console.error("Organization user limit check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking organization user limit",
    });
  }
};
