import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICustomerSubscription extends Document {
  customer_id: Types.ObjectId;
  plan_id: string;
  status: "active" | "canceled"; // Simplified status options
  startDate: Date;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSubscriptionSchema = new Schema<ICustomerSubscription>(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    plan_id: {
      type: String,
      required: true,
      enum: ["free", "basic", "pro"],
    },
    status: {
      type: String,
      enum: ["active", "canceled"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each customer has only one active subscription
CustomerSubscriptionSchema.index(
  { customer_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export default mongoose.model<ICustomerSubscription>(
  "CustomerSubscription",
  CustomerSubscriptionSchema
);
