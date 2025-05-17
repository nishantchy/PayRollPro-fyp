import SubscriptionPlan from "../models/subscription-plan.model";
import CustomerSubscription from "../models/customer-subscription.model";
import Organization from "../models/organization.model";
import OrgUser from "../models/org.user.model";
import { Types } from "mongoose";

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlan = async (planId: string) => {
  return await SubscriptionPlan.findOne({ plan_id: planId });
};

/**
 * Get all subscription plans
 */
export const getAllSubscriptionPlans = async () => {
  return await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
};

/**
 * Get customer's active subscription
 */
export const getCustomerSubscription = async (customerId: string) => {
  return await CustomerSubscription.findOne({
    customer_id: customerId,
    status: { $in: ["active", "trial"] },
  });
};

/**
 * Create default free subscription for new customer
 */
export const createDefaultSubscription = async (customerId: string) => {
  const freePlan = await SubscriptionPlan.findOne({ plan_id: "free" });

  if (!freePlan) {
    throw new Error("Free plan not found");
  }

  const subscription = await CustomerSubscription.create({
    customer_id: customerId,
    plan_id: "free",
    status: "active",
    startDate: new Date(),
  });

  return subscription;
};

/**
 * Check if customer can create more organizations
 */
export const canCreateMoreOrganizations = async (
  customerId: string
): Promise<boolean> => {
  // Get customer's active subscription
  const subscription = await CustomerSubscription.findOne({
    customer_id: customerId,
    status: { $in: ["active", "trial"] },
  });

  if (!subscription) {
    // Default to free plan limits if no active subscription
    const freePlan = await SubscriptionPlan.findOne({ plan_id: "free" });
    if (!freePlan) return false;

    // Count existing organizations
    const orgCount = await Organization.countDocuments({
      customer_id: customerId,
    });

    return orgCount < freePlan.features.maxOrganizations;
  }

  // Get subscription plan details
  const plan = await SubscriptionPlan.findOne({
    plan_id: subscription.plan_id,
  });
  if (!plan) return false;

  // Unlimited organizations for Pro plan (-1 means unlimited)
  if (plan.features.maxOrganizations === -1) return true;

  // Count existing organizations
  const orgCount = await Organization.countDocuments({
    customer_id: customerId,
  });

  // Check if customer can create more organizations
  return orgCount < plan.features.maxOrganizations;
};

/**
 * Check if organization can add more users
 */
export const canAddMoreUsers = async (
  orgId: string | Types.ObjectId,
  customerId: string
): Promise<boolean> => {
  // Get customer's active subscription
  const subscription = await CustomerSubscription.findOne({
    customer_id: customerId,
    status: { $in: ["active", "trial"] },
  });

  if (!subscription) {
    // Default to free plan limits if no active subscription
    const freePlan = await SubscriptionPlan.findOne({ plan_id: "free" });
    if (!freePlan) return false;

    // Count existing users in this organization
    const userCount = await OrgUser.countDocuments({
      org_id: orgId,
      customer_id: customerId,
    });

    return userCount < freePlan.features.maxUsersPerOrg;
  }

  // Get subscription plan details
  const plan = await SubscriptionPlan.findOne({
    plan_id: subscription.plan_id,
  });
  if (!plan) return false;

  // Unlimited users for Pro plan (-1 means unlimited)
  if (plan.features.maxUsersPerOrg === -1) return true;

  // Count existing users in this organization
  const userCount = await OrgUser.countDocuments({
    org_id: orgId,
    customer_id: customerId,
  });

  // Check if organization can add more users
  return userCount < plan.features.maxUsersPerOrg;
};

/**
 * Upgrade customer subscription to a new plan
 */
export const upgradeSubscription = async (
  customerId: string,
  planId: string,
  paymentMethod?: string,
  paymentId?: string
) => {
  // Get the new plan
  const plan = await SubscriptionPlan.findOne({ plan_id: planId });
  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  // Cancel any existing active subscription
  await CustomerSubscription.updateMany(
    { customer_id: customerId, status: "active" },
    { status: "canceled" }
  );

  // Create new subscription
  const subscription = await CustomerSubscription.create({
    customer_id: customerId,
    plan_id: planId,
    status: "active",
    startDate: new Date(),
    paymentMethod,
    paymentId,
  });

  return subscription;
};

/**
 * Cancel customer subscription
 */
export const cancelSubscription = async (
  customerId: string,
  cancelReason?: string
) => {
  const subscription = await CustomerSubscription.findOneAndUpdate(
    { customer_id: customerId, status: "active" },
    { status: "canceled", cancelReason, isAutoRenew: false },
    { new: true }
  );

  return subscription;
};
