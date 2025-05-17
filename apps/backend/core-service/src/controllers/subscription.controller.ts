import { Request, Response } from "express";
import {
  getAllSubscriptionPlans,
  getCustomerSubscription,
  upgradeSubscription,
  cancelSubscription,
  getSubscriptionPlan,
} from "../services/subscription.service";

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    const plans = await getAllSubscriptionPlans();

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get subscription plans",
    });
  }
};

/**
 * Get customer's current subscription
 */
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const customerId = req.user.id;

    // Get subscription from database
    const subscription = await getCustomerSubscription(customerId);

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          plan_id: "free",
          status: "active",
          isDefault: true,
        },
        message: "Using free plan",
      });
    }

    // Get plan details
    const plan = await getSubscriptionPlan(subscription.plan_id);

    res.status(200).json({
      success: true,
      data: {
        ...subscription.toObject(),
        plan,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get subscription",
    });
  }
};

/**
 * Process Stripe payment for subscription upgrade
 * This is a simplified version for testing
 */
const processStripePayment = async (
  amount: number,
  currency: string = "NPR"
) => {
  // This would normally call the Stripe API
  return {
    id: `stripe_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount,
    currency,
    status: "succeeded",
    provider: "stripe",
  };
};

/**
 * Process PayPal payment for subscription upgrade
 * This is a simplified version for testing
 */
const processPayPalPayment = async (
  amount: number,
  currency: string = "NPR"
) => {
  // This would normally call the PayPal API
  return {
    id: `paypal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount,
    currency,
    status: "completed",
    provider: "paypal",
  };
};

/**
 * Upgrade customer's subscription to a new plan
 */
export const upgradeCustomerSubscription = async (
  req: Request,
  res: Response
) => {
  try {
    const customerId = req.user.id;
    const { plan_id, payment_method } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Check if plan exists and is active
    const plan = await getSubscriptionPlan(plan_id);

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found or inactive",
      });
    }

    // Free plan doesn't need payment processing
    if (plan_id === "free") {
      const subscription = await upgradeSubscription(customerId, plan_id);

      return res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription changed to free plan",
      });
    }

    // Process payment based on the method
    let paymentResult;
    const paymentMethodUsed = payment_method || "stripe";

    if (paymentMethodUsed === "paypal") {
      paymentResult = await processPayPalPayment(plan.price);
    } else {
      // Default to Stripe
      paymentResult = await processStripePayment(plan.price);
    }

    // Create a new subscription with the payment information
    const subscription = await upgradeSubscription(
      customerId,
      plan_id,
      paymentMethodUsed,
      paymentResult.id
    );

    res.status(200).json({
      success: true,
      data: subscription,
      message: `Subscription upgraded to ${plan.name} (lifetime)`,
      payment: paymentResult,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upgrade subscription",
    });
  }
};

/**
 * Cancel customer's subscription
 */
export const cancelCustomerSubscription = async (
  req: Request,
  res: Response
) => {
  try {
    const customerId = req.user.id;
    const { reason } = req.body;

    const subscription = await cancelSubscription(customerId, reason);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
      message: "Subscription canceled successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel subscription",
    });
  }
};
