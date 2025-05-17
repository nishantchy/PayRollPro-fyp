import mongoose, { Schema, Document } from "mongoose";
import { Counter } from "./counter.model";

export interface IOrganization extends Document {
  name: string;
  organization_id: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  customer_id: mongoose.Types.ObjectId;
  industry?: string;
  status: "active" | "inactive";
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  signature?: string;
  signatory_name?: string;
}

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    organization_id: {
      type: String,
      unique: true,
    },
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    industry: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    description: String,
    phone: String,
    email: String,
    website: String,
    signature: String,
    signatory_name: String,
  },
  { timestamps: true }
);

// Pre-save middleware to generate organization_id
OrganizationSchema.pre("save", async function (next) {
  try {
    // Only generate ID if it's a new document
    if (!this.isNew) {
      return next();
    }

    const counter = await Counter.findByIdAndUpdate(
      { _id: "organization_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Format: ORG001, ORG002, etc.
    this.organization_id = `ORG${counter.seq.toString().padStart(3, "0")}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);
