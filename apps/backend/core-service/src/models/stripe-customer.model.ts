import mongoose, { Document, Schema } from "mongoose";

export interface IStripeCustomer extends Document {
  customer_id: string;
  stripe_customer_id: string;
  stripe_payment_methods?: string[];
  stripe_subscription_id?: string;
  has_payment_method: boolean;
  last_payment_date?: Date;
  default_payment_method?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StripeCustomerSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    stripe_customer_id: {
      type: String,
      required: true,
    },
    stripe_payment_methods: {
      type: [String],
      default: [],
    },
    stripe_subscription_id: {
      type: String,
    },
    has_payment_method: {
      type: Boolean,
      default: false,
    },
    last_payment_date: {
      type: Date,
    },
    default_payment_method: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups
StripeCustomerSchema.index({ customer_id: 1 }, { unique: true });
StripeCustomerSchema.index({ stripe_customer_id: 1 }, { unique: true });

export default mongoose.model<IStripeCustomer>(
  "StripeCustomer",
  StripeCustomerSchema
);
