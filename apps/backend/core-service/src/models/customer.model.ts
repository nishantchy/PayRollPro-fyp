import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  password?: string;
  customer_id?: string;
  photo?: string;
  has_organization: boolean;
  org_count: number;
  hasOnboarded: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  subscription_plan?: string;
  status: "active" | "inactive";
  authMethod?: "email" | "google";
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    customer_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    photo: String,
    has_organization: {
      type: Boolean,
      default: false,
    },
    org_count: {
      type: Number,
      default: 0,
    },
    hasOnboarded: {
      type: Boolean,
      default: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    phone: String,
    subscription_plan: {
      type: String,
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    authMethod: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    googleId: String,
    refreshToken: String,
  },
  { timestamps: true }
);

// Generate customer_id before saving
CustomerSchema.pre("save", async function (next) {
  try {
    if (!this.customer_id) {
      const counter = await mongoose
        .model("Counter")
        .findByIdAndUpdate(
          { _id: "customer_id" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

      this.customer_id = `CUSTOMER${counter.seq.toString().padStart(3, "0")}`;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
