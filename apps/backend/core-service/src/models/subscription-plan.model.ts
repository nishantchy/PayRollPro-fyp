import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionPlan extends Document {
  plan_id: string;
  name: string;
  description: string;
  price: number;
  planType: "lifetime";
  features: {
    maxOrganizations: number;
    maxUsersPerOrg: number;
    prioritySupport: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    plan_id: {
      type: String,
      required: true,
      unique: true,
      enum: ["free", "basic", "pro"],
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    planType: {
      type: String,
      enum: ["lifetime"],
      default: "lifetime",
    },
    features: {
      maxOrganizations: {
        type: Number,
        required: true,
      },
      maxUsersPerOrg: {
        type: Number,
        required: true,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  SubscriptionPlanSchema
);
