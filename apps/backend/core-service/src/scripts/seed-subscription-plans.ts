import mongoose from "mongoose";
import dotenv from "dotenv";
import SubscriptionPlan from "../models/subscription-plan.model";
import dbConnect from "../config/dbConnect";

// Load environment variables
dotenv.config();

// Subscription plans data
const subscriptionPlans = [
  {
    plan_id: "free",
    name: "Free Plan",
    description: "Basic features for small teams getting started",
    price: 0,
    planType: "lifetime",
    features: {
      maxOrganizations: 1,
      maxUsersPerOrg: 5,
      prioritySupport: false,
    },
    isActive: true,
  },
  {
    plan_id: "basic",
    name: "Basic Plan",
    description: "Essential features for growing teams",
    price: 50000, // NPR pricing
    planType: "lifetime",
    features: {
      maxOrganizations: 3,
      maxUsersPerOrg: 20,
      prioritySupport: true,
    },
    isActive: true,
  },
  {
    plan_id: "pro",
    name: "Pro Plan",
    description: "Advanced features for professional teams",
    price: 100000, // NPR pricing
    planType: "lifetime",
    features: {
      maxOrganizations: -1, // -1 for unlimited
      maxUsersPerOrg: -1, // -1 for unlimited
      prioritySupport: true,
    },
    isActive: true,
  },
];

// Seed subscription plans
const seedSubscriptionPlans = async () => {
  try {
    // Connect to MongoDB using the config
    await dbConnect();

    try {
      // Try to drop the collection entirely
      await mongoose.connection.db?.collection("subscriptionplans").drop();
      console.log("Subscription plans collection dropped");
    } catch (err) {
      console.log("Collection might not exist yet, continuing...");
    }

    // Create new plans
    await SubscriptionPlan.insertMany(subscriptionPlans);

    console.log("Subscription plans seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding subscription plans: ${error}`);
    process.exit(1);
  }
};

// Run the seeding function
seedSubscriptionPlans();
